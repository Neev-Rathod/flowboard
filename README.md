# Flowboard

This is the baseline structure for the app containing a React Vite frontend, FastAPI backend, and multi-container Docker configuration.

The app now includes a basic login system with JWT authentication. The backend stores users in SQLite for local development and PostgreSQL when `DATABASE_URL` is provided.

## Folder Structure

- `frontend/`: React app scaffolded with Vite.
- `backend/`: FastAPI app with register/login endpoints, connected to SQLite locally or PostgreSQL in production.

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

## Deployment (With Docker)

Run `docker-compose up -d --build` to deploy the entire stack.

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:8000
- PostgreSQL runs via docker on port `5432`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway commands, CORS settings, and database bootstrap steps.
