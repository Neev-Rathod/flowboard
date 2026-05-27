import os

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, or_, text
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from dependencies import get_db, get_current_user
from models import User
from schemas import AuthResponse, UserCreate, UserLogin, UserOut
from security import create_access_token, get_password_hash, verify_password
from seed import ensure_demo_seed

# import routers
from routers.organization import router as organization_router
from routers.workflows import router as workflows_router

# Create database tables
Base.metadata.create_all(bind=engine)


def ensure_sqlite_columns() -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    with engine.begin() as connection:
        user_columns = {column["name"] for column in inspector.get_columns("users")}
        if "role" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'employee'"))
        if "job_title" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN job_title VARCHAR(120) NOT NULL DEFAULT 'Employee'"))
        if "company_id" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN company_id INTEGER"))
        if "manager_id" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN manager_id INTEGER"))

        workflow_columns = {column["name"] for column in inspector.get_columns("workflows")}
        if "company_id" not in workflow_columns:
            connection.execute(text("ALTER TABLE workflows ADD COLUMN company_id INTEGER"))

        run_columns = {column["name"] for column in inspector.get_columns("workflow_runs")}
        if "assigned_to" not in run_columns:
            connection.execute(text("ALTER TABLE workflow_runs ADD COLUMN assigned_to INTEGER"))


ensure_sqlite_columns()


app = FastAPI(title="Flowboard API")

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGIN", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]

allow_all_origins = os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else frontend_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        ensure_demo_seed(db)
    finally:
        db.close()


def build_auth_response(user: User, token: str) -> AuthResponse:
    return AuthResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


# include routers
app.include_router(workflows_router)
app.include_router(organization_router)


@app.get("/")
def read_root():
    return {"message": "Flowboard API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(User)
        .filter(or_(User.username == payload.username, User.email == payload.email))
        .first()
    )
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists",
        )

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        job_title=payload.job_title,
        company_id=payload.company_id,
        manager_id=payload.manager_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "username": user.username})
    return build_auth_response(user, token)


@app.post("/auth/login", response_model=AuthResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token({"sub": str(user.id), "username": user.username})
    return build_auth_response(user, token)


@app.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
