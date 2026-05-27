from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "employee"
    job_title: str = "Employee"
    company_id: Optional[int] = None
    manager_id: Optional[int] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    role: str
    job_title: str
    company_id: Optional[int] = None
    manager_id: Optional[int] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Workflow schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "normal"
    status: Optional[str] = "todo"
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    stage_id: int
    created_at: Optional[datetime]


class StageBase(BaseModel):
    title: str
    position: Optional[int] = 0
    color: Optional[str] = None
    completion_rule: Optional[str] = None


class StageCreate(StageBase):
    pass


class StageOut(StageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workflow_id: int
    tasks: List[TaskOut] = []


class WorkflowBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_template: Optional[bool] = False
    visibility: Optional[str] = "private"


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowOut(WorkflowBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: int
    created_at: Optional[datetime]
    stages: List[StageOut] = []


class WorkflowRunCreate(BaseModel):
    workflow_id: int
    assigned_to: Optional[int] = None


class WorkflowRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workflow_id: int
    started_by: int
    assigned_to: Optional[int] = None
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]


class TaskRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workflow_run_id: int
    task_id: int
    status: str
    completed_at: Optional[datetime]
    notes: Optional[str]


class OrgUserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "employee"
    job_title: str = "Employee"
    company_id: Optional[int] = None
    manager_id: Optional[int] = None


class OrgUserUpdate(BaseModel):
    role: Optional[str] = None
    job_title: Optional[str] = None
    manager_id: Optional[int] = None


class OrgUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    role: str
    job_title: str
    company_id: Optional[int] = None
    manager_id: Optional[int] = None


class CompanyBase(BaseModel):
    name: str
    domain: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyOut(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime]

