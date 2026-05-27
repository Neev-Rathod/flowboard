from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Company, Task, TaskRun, User, Workflow, WorkflowRun, WorkflowStage
from security import get_password_hash


DEFAULT_COMPANY_NAME = "Northstar Systems"


DEMO_USERS = [
    {"username": "admin1", "email": "admin1@northstar.example", "role": "admin", "job_title": "Platform Admin"},
    {"username": "ceo1", "email": "ceo@northstar.example", "role": "executive", "job_title": "Chief Executive Officer"},
    {"username": "cfo1", "email": "cfo@northstar.example", "role": "finance", "job_title": "Chief Financial Officer"},
    {"username": "cto1", "email": "cto@northstar.example", "role": "tech", "job_title": "Chief Technology Officer"},
    {"username": "hr1", "email": "hr@northstar.example", "role": "hr", "job_title": "HR Director"},
    {"username": "salesdir1", "email": "sales.director@northstar.example", "role": "sales", "job_title": "Sales Director"},
    {"username": "engmgr1", "email": "eng.mgr@northstar.example", "role": "manager", "job_title": "Engineering Manager"},
    {"username": "prodmgr1", "email": "product.mgr@northstar.example", "role": "manager", "job_title": "Product Manager"},
    {"username": "opsmgr1", "email": "ops.mgr@northstar.example", "role": "manager", "job_title": "Operations Manager"},
    {"username": "finmgr1", "email": "finance.mgr@northstar.example", "role": "manager", "job_title": "Finance Manager"},
    {"username": "salesmgr1", "email": "sales.mgr@northstar.example", "role": "manager", "job_title": "Sales Manager"},
    {"username": "hrbp1", "email": "hrbp@northstar.example", "role": "hr", "job_title": "HR Business Partner"},
    {"username": "recruiter1", "email": "recruiter@northstar.example", "role": "hr", "job_title": "Recruiter"},
    {"username": "finanalyst1", "email": "finance.analyst@northstar.example", "role": "finance", "job_title": "Financial Analyst"},
    {"username": "salesrep1", "email": "sales1@northstar.example", "role": "sales", "job_title": "Senior Sales Representative"},
    {"username": "salesrep2", "email": "sales2@northstar.example", "role": "sales", "job_title": "Sales Representative"},
    {"username": "backenddev1", "email": "backend1@northstar.example", "role": "developer", "job_title": "Senior Backend Developer"},
    {"username": "backenddev2", "email": "backend2@northstar.example", "role": "developer", "job_title": "Backend Developer"},
    {"username": "frontenddev1", "email": "frontend1@northstar.example", "role": "developer", "job_title": "Frontend Developer"},
    {"username": "frontenddev2", "email": "frontend2@northstar.example", "role": "developer", "job_title": "Frontend Developer"},
    {"username": "qalead1", "email": "qa.lead@northstar.example", "role": "qa", "job_title": "QA Lead"},
    {"username": "qa1", "email": "qa1@northstar.example", "role": "qa", "job_title": "QA Engineer"},
    {"username": "productowner1", "email": "po@northstar.example", "role": "product", "job_title": "Product Owner"},
    {"username": "support1", "email": "support1@northstar.example", "role": "support", "job_title": "Customer Support Specialist"},
    {"username": "support2", "email": "support2@northstar.example", "role": "support", "job_title": "Technical Support Engineer"},
    {"username": "devops1", "email": "devops@northstar.example", "role": "devops", "job_title": "DevOps Engineer"},
    {"username": "marketing1", "email": "marketing@northstar.example", "role": "marketing", "job_title": "Marketing Lead"},
]


DEMO_WORKFLOWS = [
    {
        "title": "Employee Onboarding",
        "description": "Hire-to-productivity onboarding pipeline.",
        "category": "hr",
        "stages": ["Offer Accepted", "Provision Access", "First Week", "First Month"],
    },
    {
        "title": "Software Release",
        "description": "Engineering delivery workflow from planning to deployment.",
        "category": "engineering",
        "stages": ["Planning", "Build", "QA", "Deploy", "Monitor"],
    },
    {
        "title": "Sales Deal Flow",
        "description": "Lead qualification and closing workflow for sales teams.",
        "category": "sales",
        "stages": ["Lead Qualify", "Discovery", "Proposal", "Negotiation", "Closed Won"],
    },
    {
        "title": "Finance Approval Chain",
        "description": "Approvals for invoices, budgets, and procurement.",
        "category": "finance",
        "stages": ["Request", "Review", "Approval", "Execution"],
    },
]


def ensure_demo_seed(db: Session) -> bool:
    existing_admin = db.query(User).filter(User.username == "admin1").first()
    existing_company = db.query(Company).filter(Company.name == DEFAULT_COMPANY_NAME).first()
    if existing_admin is not None and existing_company is not None:
        return False

    company = existing_company or Company(name=DEFAULT_COMPANY_NAME, domain="northstar.example")
    db.add(company)
    db.commit()
    db.refresh(company)

    users_by_username: dict[str, User] = {}
    manager_links: dict[str, str | None] = {}
    for index, user_data in enumerate(DEMO_USERS):
        manager_username = None
        if user_data["username"] == "ceo1":
            manager_username = "admin1"
        elif user_data["username"] in {"cfo1", "cto1", "hr1", "salesdir1"}:
            manager_username = "ceo1"
        elif user_data["username"] in {"engmgr1", "prodmgr1", "opsmgr1", "finmgr1", "salesmgr1", "hrbp1", "recruiter1", "marketing1"}:
            manager_username = {
                "engmgr1": "cto1",
                "prodmgr1": "cto1",
                "opsmgr1": "ceo1",
                "finmgr1": "cfo1",
                "salesmgr1": "salesdir1",
                "hrbp1": "hr1",
                "recruiter1": "hr1",
                "marketing1": "ceo1",
            }[user_data["username"]]
        elif user_data["username"] in {"finanalyst1"}:
            manager_username = "finmgr1"
        elif user_data["username"] in {"salesrep1", "salesrep2"}:
            manager_username = "salesmgr1"
        elif user_data["username"] in {"backenddev1", "backenddev2", "frontenddev1", "frontenddev2", "qalead1", "qa1", "productowner1", "support1", "support2", "devops1"}:
            manager_username = {
                "backenddev1": "engmgr1",
                "backenddev2": "engmgr1",
                "frontenddev1": "engmgr1",
                "frontenddev2": "engmgr1",
                "qalead1": "engmgr1",
                "qa1": "qalead1",
                "productowner1": "prodmgr1",
                "support1": "opsmgr1",
                "support2": "opsmgr1",
                "devops1": "opsmgr1",
            }[user_data["username"]]

        manager_links[user_data["username"]] = manager_username

        user = User(
            username=user_data["username"],
            email=user_data["email"],
            password_hash=get_password_hash("password123"),
            role=user_data["role"],
            job_title=user_data["job_title"],
            company_id=company.id,
        )
        db.add(user)
        db.flush()
        users_by_username[user.username] = user

    for username, manager_username in manager_links.items():
        if manager_username and manager_username in users_by_username:
            users_by_username[username].manager_id = users_by_username[manager_username].id

    db.commit()

    for workflow_data in DEMO_WORKFLOWS:
        creator = users_by_username["admin1"]
        workflow = Workflow(
            title=workflow_data["title"],
            description=workflow_data["description"],
            category=workflow_data["category"],
            company_id=company.id,
            created_by=creator.id,
            is_template=True,
            visibility="private",
        )
        db.add(workflow)
        db.flush()

        stage_objects: list[WorkflowStage] = []
        for position, stage_title in enumerate(workflow_data["stages"]):
            stage = WorkflowStage(
                workflow_id=workflow.id,
                title=stage_title,
                position=position,
                color=["sky", "emerald", "amber", "violet", "rose"][position % 5],
                completion_rule="all_tasks_complete",
            )
            db.add(stage)
            db.flush()
            stage_objects.append(stage)

            task = Task(
                stage_id=stage.id,
                title=f"{stage_title} Task",
                description=f"Complete {stage_title.lower()} work for {workflow.title}.",
                priority="high" if position == 0 else "normal",
                status="todo",
                assigned_to=users_by_username["admin1"].id,
            )
            db.add(task)
        db.flush()

        workflow_run = WorkflowRun(
            workflow_id=workflow.id,
            started_by=creator.id,
            assigned_to=creator.id,
            status="running",
        )
        db.add(workflow_run)
        db.flush()

        for task in db.query(Task).join(WorkflowStage).filter(WorkflowStage.workflow_id == workflow.id).all():
            db.add(
                TaskRun(
                    workflow_run_id=workflow_run.id,
                    task_id=task.id,
                    status=task.status,
                )
            )

    db.commit()
    return True

