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

1. Initialize the local repository and connect it to your GitHub repo.
2. Create the Railway project from the repo root:

```bash
railway init
```

3. Add PostgreSQL for production data:

```bash
railway add --database postgres
```

4. Set backend environment variables in Railway:

```bash
railway variable set SECRET_KEY=your-long-random-secret
railway variable set ACCESS_TOKEN_EXPIRE_MINUTES=60
railway variable set ALLOW_ALL_ORIGINS=true
```

5. After Railway gives the backend a public domain, set the frontend build variable on the frontend service:

```bash
railway variable set VITE_API_URL=https://your-backend-domain.up.railway.app
```

6. For the backend CORS allow list, if you want to keep it strict instead of `ALLOW_ALL_ORIGINS=true`, set:

```bash
railway variable set FRONTEND_ORIGIN=https://your-frontend-domain.up.railway.app
```

7. Deploy the current branch:

```bash
railway up
```

8. Redeploy later after a GitHub push:

```bash
railway redeploy
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

- Frontend browser requests should point to `VITE_API_URL`.
- Backend CORS should allow the frontend domain via `FRONTEND_ORIGIN` or use `ALLOW_ALL_ORIGINS=true` for bearer-token API traffic.
- In local development, the default values already work with `http://localhost:5173` and `http://localhost:8000`.