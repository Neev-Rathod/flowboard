# Deployment Guide

## Local Docker

Build and start the full stack:

```bash
docker compose up --build
```

Stop the stack and remove volumes if needed:

```bash
docker compose down -v
```

## Railway Setup

1. Create or connect the GitHub repo at `https://github.com/Neev-Rathod/flowboard`.
2. Link the local directory to the existing Railway project:

```bash
railway link
```

3. Create the app services and database if they do not already exist:

```bash
railway add --service backend
railway add --service frontend
railway add --database postgres
```

4. Wire each service to the GitHub repo and monorepo subdirectory:

```bash
railway environment edit --service-config backend source.repo https://github.com/Neev-Rathod/flowboard.git
railway environment edit --service-config backend source.branch main
railway environment edit --service-config backend source.rootDirectory "/backend"
railway environment edit --service-config backend build.builder DOCKERFILE

railway environment edit --service-config frontend source.repo https://github.com/Neev-Rathod/flowboard.git
railway environment edit --service-config frontend source.branch main
railway environment edit --service-config frontend source.rootDirectory "/frontend"
railway environment edit --service-config frontend build.builder DOCKERFILE
```

5. Set backend runtime variables:

```bash
railway variable set SECRET_KEY=your-long-random-secret --service backend
railway variable set ACCESS_TOKEN_EXPIRE_MINUTES=60 --service backend
railway variable set ALLOW_ALL_ORIGINS=true --service backend
```

6. Connect the backend to Railway Postgres:

```bash
railway variable set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service backend
```

7. Set the frontend API URL after the backend service gets a public Railway domain. The frontend image already defaults to the deployed backend URL used in this repo, so this step is optional unless your backend domain changes:

```bash
railway variable set API_BASE_URL=https://your-backend-domain.up.railway.app --service frontend
```

8. Deploy the services:

```bash
railway up --service backend --detach -m "initial backend deploy"
railway up --service frontend --detach -m "initial frontend deploy"
```

9. Redeploy later after a GitHub push:

```bash
railway redeploy --service backend --from-source --yes
railway redeploy --service frontend --from-source --yes
```

## Database Commands

The current app creates tables on startup through SQLAlchemy metadata. If you want to manually bootstrap the schema after a fresh database provision, run:

```bash
railway run python -c "from database import Base, engine; import models; Base.metadata.create_all(bind=engine)"
```

Useful database commands:

```bash
railway connect
railway logs
railway logs --build
```

## Frontend and Backend URLs

- Frontend browser requests should point to `API_BASE_URL`, which is injected at runtime by the frontend container and defaults to the deployed backend URL in this repo.
- Backend CORS should allow the frontend domain via `FRONTEND_ORIGIN` or use `ALLOW_ALL_ORIGINS=true` for bearer-token API traffic.
- In local development, the default values already work with `http://localhost:5173` and `http://localhost:8000`.
