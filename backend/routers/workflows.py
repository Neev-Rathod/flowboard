from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies import get_db, get_current_user
from models import Workflow, WorkflowStage, Task, WorkflowRun, TaskRun
from models import User
from schemas import (
    WorkflowRunCreate,
    WorkflowRunOut,
    WorkflowCreate,
    WorkflowOut,
    StageCreate,
    StageOut,
    TaskCreate,
    TaskOut,
)
from routers.organization import is_descendant

router = APIRouter(prefix="/workflows", tags=["workflows"])


@router.post("/", response_model=WorkflowOut, status_code=status.HTTP_201_CREATED)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = Workflow(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        company_id=current_user.company_id,
        created_by=current_user.id if current_user is not None else 0,
        is_template=payload.is_template,
        visibility=payload.visibility,
    )
    db.add(wf)
    db.commit()
    db.refresh(wf)
    return wf


@router.get("/", response_model=list[WorkflowOut])
def list_workflows(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = db.query(Workflow).filter(Workflow.created_by == (current_user.id if current_user else 0)).all()
    return results


@router.get("/runs", response_model=list[dict])
def list_runs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    runs = db.query(WorkflowRun).filter(WorkflowRun.started_by == (current_user.id if current_user else 0)).all()
    return [
        {"id": r.id, "workflow_id": r.workflow_id, "status": r.status, "started_at": r.started_at, "completed_at": r.completed_at}
        for r in runs
    ]


@router.get("/{workflow_id}", response_model=WorkflowOut)
def get_workflow(workflow_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if wf is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    return wf


@router.put("/{workflow_id}", response_model=WorkflowOut)
def update_workflow(workflow_id: int, payload: WorkflowCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if wf is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    wf.title = payload.title
    wf.description = payload.description
    wf.category = payload.category
    wf.is_template = payload.is_template
    wf.visibility = payload.visibility
    db.add(wf)
    db.commit()
    db.refresh(wf)
    return wf


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(workflow_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if wf is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    db.delete(wf)
    db.commit()
    return None


@router.post("/{workflow_id}/duplicate", response_model=WorkflowOut)
def duplicate_workflow(workflow_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if wf is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    new_wf = Workflow(
        title=f"{wf.title} (Copy)",
        description=wf.description,
        category=wf.category,
        company_id=wf.company_id,
        created_by=current_user.id if current_user else 0,
        is_template=wf.is_template,
        visibility=wf.visibility,
    )
    db.add(new_wf)
    db.commit()
    db.refresh(new_wf)

    # duplicate stages and tasks
    for s in wf.stages:
        ns = WorkflowStage(
            workflow_id=new_wf.id,
            title=s.title,
            position=s.position,
            color=s.color,
            completion_rule=s.completion_rule,
        )
        db.add(ns)
        db.commit()
        db.refresh(ns)
        for t in s.tasks:
            nt = Task(
                stage_id=ns.id,
                title=t.title,
                description=t.description,
                priority=t.priority,
                status=t.status,
                due_date=t.due_date,
                assigned_to=t.assigned_to,
            )
            db.add(nt)
        db.commit()

    db.refresh(new_wf)
    return new_wf


@router.get("/{workflow_id}/export", response_model=dict)
def export_workflow(workflow_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if wf is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    data = {
        "title": wf.title,
        "description": wf.description,
        "category": wf.category,
        "is_template": wf.is_template,
        "visibility": wf.visibility,
        "stages": [],
    }
    for s in wf.stages:
        sd = {"title": s.title, "position": s.position, "color": s.color, "tasks": []}
        for t in s.tasks:
            td = {"title": t.title, "description": t.description, "priority": t.priority, "status": t.status}
            sd["tasks"].append(td)
        data["stages"].append(sd)
    return data


@router.post("/import", response_model=WorkflowOut)
def import_workflow(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # basic import from JSON structure produced by export
    wf = Workflow(
        title=payload.get("title"),
        description=payload.get("description"),
        category=payload.get("category"),
        company_id=current_user.company_id,
        created_by=(current_user.id if current_user else 0),
        is_template=payload.get("is_template", False),
        visibility=payload.get("visibility", "private"),
    )
    db.add(wf)
    db.commit()
    db.refresh(wf)

    for s in payload.get("stages", []):
        st = WorkflowStage(
            workflow_id=wf.id,
            title=s.get("title"),
            position=s.get("position", 0),
            color=s.get("color"),
            completion_rule=s.get("completion_rule"),
        )
        db.add(st)
        db.commit()
        db.refresh(st)
        for t in s.get("tasks", []):
            tt = Task(
                stage_id=st.id,
                title=t.get("title"),
                description=t.get("description"),
                priority=t.get("priority"),
                status=t.get("status"),
            )
            db.add(tt)
        db.commit()

    db.refresh(wf)
    return wf


@router.put("/stages/reorder", response_model=dict)
def reorder_stages(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stage_ids = payload.get("stage_ids", [])
    for position, stage_id in enumerate(stage_ids):
        stage = db.query(WorkflowStage).filter(WorkflowStage.id == stage_id).first()
        if stage is not None:
            stage.position = position
            db.add(stage)
    db.commit()
    return {"ok": True, "stage_ids": stage_ids}


@router.post("/{workflow_id}/stages", response_model=StageOut, status_code=status.HTTP_201_CREATED)
def create_stage(workflow_id: int, payload: StageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if wf is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    stage = WorkflowStage(
        workflow_id=workflow_id,
        title=payload.title,
        position=payload.position,
        color=payload.color,
        completion_rule=payload.completion_rule,
    )
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage


@router.post("/stages/{stage_id}/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(stage_id: int, payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stage = db.query(WorkflowStage).filter(WorkflowStage.id == stage_id).first()
    if stage is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stage not found")
    task = Task(
        stage_id=stage_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        status=payload.status,
        due_date=payload.due_date,
        assigned_to=payload.assigned_to,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/stages/{stage_id}", response_model=StageOut)
def update_stage(stage_id: int, payload: StageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stage = db.query(WorkflowStage).filter(WorkflowStage.id == stage_id).first()
    if stage is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stage not found")
    stage.title = payload.title
    stage.position = payload.position
    stage.color = payload.color
    stage.completion_rule = payload.completion_rule
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage


@router.delete("/stages/{stage_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stage(stage_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stage = db.query(WorkflowStage).filter(WorkflowStage.id == stage_id).first()
    if stage is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stage not found")
    db.delete(stage)
    db.commit()
    return None


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    task.title = payload.title
    task.description = payload.description
    task.priority = payload.priority
    task.status = payload.status
    task.due_date = payload.due_date
    task.assigned_to = payload.assigned_to
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db.delete(task)
    db.commit()
    return None


@router.post("/{workflow_id}/runs", response_model=WorkflowRunOut, status_code=status.HTTP_201_CREATED)
def start_workflow_run(
    workflow_id: int,
    payload: WorkflowRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if wf is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    if payload.assigned_to is not None:
        assignee = db.query(User).filter(User.id == payload.assigned_to).first()
        if assignee is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignee not found")
        if current_user.role != "admin" and not is_descendant(db, current_user.id, assignee.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Assignee must be below your hierarchy")

    run = WorkflowRun(
        workflow_id=workflow_id,
        started_by=current_user.id if current_user else 0,
        assigned_to=payload.assigned_to,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # create task runs for all tasks in the workflow
    for stage in wf.stages:
        for task in stage.tasks:
            tr = TaskRun(workflow_run_id=run.id, task_id=task.id, status=task.status)
            db.add(tr)
    db.commit()

    return run


@router.post("/runs/{run_id}/tasks/{task_id}/complete", response_model=dict)
def complete_task_run(run_id: int, task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tr = db.query(TaskRun).filter(TaskRun.workflow_run_id == run_id, TaskRun.task_id == task_id).first()
    if tr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task run not found")
    tr.status = "completed"
    from datetime import datetime

    tr.completed_at = datetime.utcnow()
    db.add(tr)
    db.commit()
    db.refresh(tr)
    return {"id": tr.id, "status": tr.status, "completed_at": tr.completed_at}


@router.get("/dashboard/summary", response_model=dict)
def dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id if current_user else 0
    workflows = db.query(Workflow).filter(Workflow.created_by == user_id).all()
    runs = db.query(WorkflowRun).filter(WorkflowRun.started_by == user_id).all()
    tasks = (
        db.query(Task)
        .join(WorkflowStage, Task.stage_id == WorkflowStage.id)
        .join(Workflow, WorkflowStage.workflow_id == Workflow.id)
        .filter(Workflow.created_by == user_id)
        .all()
    )
    completed_tasks = [task for task in tasks if task.status == "completed"]
    overdue_tasks = [task for task in tasks if task.due_date is not None and task.status != "completed"]
    return {
        "workflow_count": len(workflows),
        "run_count": len(runs),
        "task_count": len(tasks),
        "completed_task_count": len(completed_tasks),
        "overdue_task_count": len(overdue_tasks),
        "completion_percent": round((len(completed_tasks) / len(tasks) * 100) if tasks else 0, 1),
    }
