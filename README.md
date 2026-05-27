# Flowboard

This is a workflow builder platform with a React Vite frontend, FastAPI backend, and multi-container Docker configuration.

The app includes JWT authentication plus a company hierarchy model with roles, job titles, reporting lines, workflow templates, stages, tasks, workflow runs, stage ordering, import/export, and a dashboard summary.

## Folder Structure

- `frontend/`: React app scaffolded with Vite, React Router, and shadcn-style UI primitives.
- `backend/`: FastAPI app with auth, organization hierarchy, workflow CRUD, stage/task management, workflow runs, and dashboard endpoints.

## Local Development (Without Docker)

### Backend

1. Access the `backend` folder: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate the environment and install requirements: `pip install -r requirements.txt`
4. Run server: `uvicorn main:app --reload` (Runs on http://localhost:8000)

_(By default, this will create a `local.db` sqlite database)_

### Frontend

1. Access the `frontend` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

If you deploy the frontend somewhere other than `localhost`, set `VITE_API_URL` to the backend URL.

## Workflow Features

- Company roles: admin, HR, manager, and employee-style users with reporting lines.
- Admin/org tree view for visual hierarchy management.
- Routed UI with login, dashboard, workflows, and organization pages.
- Create, edit, duplicate, archive, and delete workflows.
- Add stages and reorder them with drag and drop.
- Create tasks under stages.
- Start workflow runs and complete task runs.
- Save workflows as templates, export them as JSON, and import them back.
- View dashboard summary metrics for workflows, runs, tasks, and completion percentage.

## Demo Seed

On startup the backend seeds a demo company named `Northstar Systems` with roughly 25 users, including admin, CEO, HR, finance, sales, CTO, managers, developers, QA, support, and marketing roles.

Default demo password for seeded users: `password123`

Suggested demo login:

- Username: `admin1`
- Password: `password123`

The seed is idempotent, so it will only add the demo company and users when they are not already present.

## Backend API Surface

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /workflows`, `POST /workflows`, `GET /workflows/{id}`
- `PUT /workflows/{id}`, `DELETE /workflows/{id}`, `POST /workflows/{id}/duplicate`
- `POST /workflows/{id}/stages`, `PUT /workflows/stages/reorder`
- `POST /workflows/stages/{stage_id}/tasks`
- `POST /workflows/{id}/runs`, `POST /workflows/runs/{run_id}/tasks/{task_id}/complete`
- `GET /workflows/dashboard/summary`, `GET /workflows/{id}/export`, `POST /workflows/import`

## Deployment (With Docker)

Run `docker-compose up -d --build` to deploy the entire stack.

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:8000
- PostgreSQL runs via docker on port `5432`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway commands, CORS settings, and database bootstrap steps.
