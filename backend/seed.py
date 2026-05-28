from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Company, Task, User, Workflow, WorkflowStage
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
        "stages": [
            {
                "title": "Offer Accepted",
                "tasks": [
                    {"title": "Prepare laptop and accounts", "assignee": "hr1"},
                    {"title": "Create employee record", "assignee": "hrbp1"},
                ],
            },
            {
                "title": "Provision Access",
                "tasks": [
                    {"title": "Email and calendar setup", "assignee": "opsmgr1"},
                    {"title": "Grant tool access", "assignee": "devops1"},
                ],
            },
            {
                "title": "First Week",
                "tasks": [
                    {"title": "Manager intro and team sync", "assignee": "engmgr1"},
                    {"title": "Policy review", "assignee": "hr1"},
                ],
            },
            {
                "title": "First Month",
                "tasks": [
                    {"title": "Performance check-in", "assignee": "ceo1"},
                ],
            },
        ],
    },
    {
        "title": "Website Launch",
        "description": "Build frontend, backend, database, QA, and deploy the release.",
        "category": "engineering",
        "stages": [
            {
                "title": "Planning",
                "tasks": [
                    {"title": "Define scope and milestones", "assignee": "productowner1"},
                    {"title": "Approve delivery plan", "assignee": "prodmgr1"},
                ],
            },
            {
                "title": "Build Frontend",
                "tasks": [
                    {"title": "Create landing page UI", "assignee": "frontenddev1"},
                    {"title": "Wire routing and forms", "assignee": "frontenddev2"},
                ],
            },
            {
                "title": "Build Backend",
                "tasks": [
                    {"title": "Create API endpoints", "assignee": "backenddev1"},
                    {"title": "Model database entities", "assignee": "backenddev2"},
                ],
            },
            {
                "title": "QA",
                "tasks": [
                    {"title": "Test user flows", "assignee": "qa1"},
                    {"title": "Regression checklist", "assignee": "qalead1"},
                ],
            },
            {
                "title": "Deploy",
                "tasks": [
                    {"title": "Prepare CI/CD release", "assignee": "devops1"},
                    {"title": "Smoke verify production", "assignee": "devops1"},
                ],
            },
        ],
    },
    {
        "title": "Sales Deal Flow",
        "description": "Lead qualification and closing workflow for sales teams.",
        "category": "sales",
        "stages": [
            {"title": "Lead Qualify", "tasks": [{"title": "Research account", "assignee": "salesrep1"}]},
            {"title": "Discovery", "tasks": [{"title": "Discovery call", "assignee": "salesrep2"}]},
            {"title": "Proposal", "tasks": [{"title": "Draft proposal", "assignee": "salesmgr1"}]},
            {"title": "Negotiation", "tasks": [{"title": "Discount approval", "assignee": "salesdir1"}]},
            {"title": "Closed Won", "tasks": [{"title": "Kickoff handoff", "assignee": "salesrep1"}]},
        ],
    },
    {
        "title": "Finance Approval Chain",
        "description": "Approvals for invoices, budgets, and procurement.",
        "category": "finance",
        "stages": [
            {"title": "Request", "tasks": [{"title": "Submit budget request", "assignee": "finanalyst1"}]},
            {"title": "Review", "tasks": [{"title": "Validate request", "assignee": "finmgr1"}]},
            {"title": "Approval", "tasks": [{"title": "Approve expenditure", "assignee": "cfo1"}]},
            {"title": "Execution", "tasks": [{"title": "Release funds", "assignee": "opsmgr1"}]},
        ],
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
            is_attached=True,
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
            is_template=False,
            visibility="public",
        )
        db.add(workflow)
        db.flush()

        for position, stage_data in enumerate(workflow_data["stages"]):
            stage_title = stage_data["title"]
            stage = WorkflowStage(
                workflow_id=workflow.id,
                title=stage_title,
                position=position,
                color=["sky", "emerald", "amber", "violet", "rose"][position % 5],
                completion_rule="all_tasks_complete",
            )
            db.add(stage)
            db.flush()

            for task_index, task_data in enumerate(stage_data["tasks"]):
                assignee = users_by_username.get(task_data.get("assignee", "admin1"), users_by_username["admin1"])
                task = Task(
                    stage_id=stage.id,
                    title=task_data["title"],
                    description=task_data.get(
                        "description",
                        f"Complete {task_data['title'].lower()} for {workflow.title}.",
                    ),
                    priority=task_data.get("priority", "high" if position == 0 else "normal"),
                    status="todo",
                    assigned_to=assignee.id,
                )
                db.add(task)
        db.flush()

    db.commit()
    return True

