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
    is_attached: bool = False


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class OrganizationCreate(BaseModel):
    organization_name: str
    admin_username: str
    admin_email: str
    password: str


# Workflow schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "normal"
    status: Optional[str] = "todo"
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    notes: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    stage_id: int
    created_at: Optional[datetime]
    completed_at: Optional[datetime]


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
    visibility: Optional[str] = "public"


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowOut(WorkflowBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: int
    created_at: Optional[datetime]
    stages: List[StageOut] = []


class WorkflowBoardTaskOut(BaseModel):
    id: int
    task_id: int
    title: str
    description: Optional[str] = None
    priority: Optional[str] = None
    status: str
    assigned_to: Optional[int] = None
    stage_id: int
    stage_title: str
    locked: bool
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None


class WorkflowBoardStageOut(BaseModel):
    id: int
    title: str
    position: int
    color: Optional[str] = None
    locked: bool
    completed: bool
    tasks: List[WorkflowBoardTaskOut] = []


class TaskCompletionPayload(BaseModel):
    notes: Optional[str] = None


class WorkflowBoardOut(BaseModel):
    id: int
    workflow_id: int
    workflow_title: str
    status: str
    created_at: Optional[datetime]
    completed_at: Optional[datetime]
    current_stage_position: Optional[int] = None
    stages: List[WorkflowBoardStageOut] = []


class OrgUserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "employee"
    job_title: str = "Employee"
    company_id: Optional[int] = None
    manager_id: Optional[int] = None


class OrgUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    job_title: Optional[str] = None
    manager_id: Optional[int] = None
    is_attached: Optional[bool] = None


class OrgUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    role: str
    job_title: str
    company_id: Optional[int] = None
    manager_id: Optional[int] = None
    is_attached: bool = False


class CompanyBase(BaseModel):
    name: str
    domain: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyOut(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime]

