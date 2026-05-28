from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies import get_db, get_current_user
from models import Task, User
from schemas import OrgUserCreate, OrgUserOut, OrgUserUpdate
from security import get_password_hash

router = APIRouter(prefix="/organization", tags=["organization"])


def is_descendant(db: Session, manager_id: int, user_id: int) -> bool:
    current = db.query(User).filter(User.id == user_id).first()
    while current and current.manager_id is not None:
        if current.manager_id == manager_id:
            return True
        current = db.query(User).filter(User.id == current.manager_id).first()
    return False


def build_tree(users: list[User]) -> list[dict]:
    attached_users = [user for user in users if user.is_attached]
    nodes = {
        user.id: {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "job_title": user.job_title,
            "company_id": user.company_id,
            "manager_id": user.manager_id,
            "children": [],
        }
        for user in attached_users
    }
    roots: list[dict] = []
    for user in attached_users:
        node = nodes[user.id]
        if user.manager_id and user.manager_id in nodes:
            nodes[user.manager_id]["children"].append(node)
        else:
            roots.append(node)
    return roots


@router.get("/users", response_model=list[OrgUserOut])
def list_org_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).order_by(User.is_attached.desc(), User.id.asc()).all()


@router.get("/tree", response_model=list[dict])
def get_org_tree(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).order_by(User.is_attached.desc(), User.id.asc()).all()
    return build_tree(users)


@router.post("/users", response_model=OrgUserOut, status_code=status.HTTP_201_CREATED)
def create_org_user(payload: OrgUserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in {"admin", "hr"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admin or HR can add users")

    if payload.manager_id is not None and db.query(User).filter(User.id == payload.manager_id).first() is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Manager not found")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        job_title=payload.job_title,
        company_id=payload.company_id if payload.company_id is not None else current_user.company_id,
        manager_id=payload.manager_id,
        is_attached=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=OrgUserOut)
def update_org_user(user_id: int, payload: OrgUserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in {"admin", "hr"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admin or HR can update users")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.username is not None:
        duplicate_username = (
            db.query(User)
            .filter(User.username == payload.username, User.id != user.id)
            .first()
        )
        if duplicate_username is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
        user.username = payload.username

    if payload.email is not None:
        duplicate_email = (
            db.query(User)
            .filter(User.email == payload.email, User.id != user.id)
            .first()
        )
        if duplicate_email is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
        user.email = payload.email

    if payload.manager_id is not None and payload.manager_id != user.manager_id:
        if payload.manager_id == user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User cannot manage themselves")
        manager = db.query(User).filter(User.id == payload.manager_id).first()
        if manager is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Manager not found")

    if payload.role is not None:
        user.role = payload.role
    if payload.job_title is not None:
        user.job_title = payload.job_title
    if hasattr(payload, "company_id") and payload.company_id is not None:
        user.company_id = payload.company_id
    if payload.manager_id is not None:
        user.manager_id = payload.manager_id
        user.is_attached = True
    if payload.is_attached is not None:
        user.is_attached = payload.is_attached

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_org_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in {"admin", "hr"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admin or HR can delete users")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    reports = db.query(User).filter(User.manager_id == user.id).all()
    for report in reports:
        report.manager_id = None
        report.is_attached = False
        db.add(report)

    tasks = db.query(Task).filter(Task.assigned_to == user.id).all()
    for task in tasks:
        task.assigned_to = None
        db.add(task)

    db.delete(user)
    db.commit()
    return None


@router.post("/assignments/workflows/{workflow_id}/run")
def assign_workflow_run(
    workflow_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assigned_to = payload.get("assigned_to")
    if assigned_to is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="assigned_to is required")

    if current_user.role not in {"admin", "manager"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins and managers can assign workflow runs")

    assignee = db.query(User).filter(User.id == assigned_to).first()
    if assignee is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignee not found")

    if current_user.role != "admin" and not is_descendant(db, current_user.id, assigned_to):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Assignee must be below your hierarchy")

    return {
        "workflow_id": workflow_id,
        "assigned_to": assignee.id,
        "assigned_to_username": assignee.username,
        "assigned_by": current_user.id,
        "assigned_by_username": current_user.username,
    }
