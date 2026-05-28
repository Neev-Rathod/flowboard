# 🔮 Flowboard | Org Orchestration Platform

Flowboard is a visually stunning, high-fidelity operations workspace that bridges corporate reporting structures and active sequential tasks. By combining a zoomable organization canvas with board-based pipeline builders, Flowboard enables companies to map hierarchies and run sequential workflows cleanly in a modern, dark-first interface.

---


## ✨ Core Premium Features

### 💻 Product Studio & High-Fidelity Showroom
- **Tab Deck Showroom**: An interactive marketing slide deck showcasing `dashboard.png`, `workflow.png`, `task.png`, and `organization.png`. Highlights selected tabs with automatic 5-second cycling progress bars, hover-pausing, and modern CSS-driven border glows.
- **Infinite Brand Marquee**: A continuous, high-performance brand scroller displaying high-tech brand vector logos with custom SVGs.
- **Vibrant Hero**: Premium high-contrast violet-to-pink typography, sparkles indicators, and sleek glassmorphic sticky headers.

### 🕹️ Live Playgrounds (Bento Grid)
- **Kanban Simulator Widget**: Interact with a live drag-and-drop simulation showing cards shifting dynamically from *Todo* -> *Progress* -> *Done* with color-shifting stage indicators.
- **Hierarchy Promoter Widget**: Promote mock employees inside a miniature live visual reporting tree and watch direct reports update instantaneously.

### 🌳 Organization Graph Canvas
- **Dynamic tree layouts**: Powered by `@xyflow/react` (React Flow), inspect reporting relationships, roles, and levels visually in a zoomable, high-contrast grid.
- **Node-based updates**: Add, edit, or modify reporting structures directly inside the graph instead of managing archaic corporate tables.

### 📋 Custom Workflows & Boards
- **Multi-lane Pipelines**: Run work stage-by-stage with complete backlog capacity markers and task status filters.
- **Sequential validations**: Unlocks step-by-step progress—preceding tasks must be completed before subsequent phases unlock.
- **JSON Import/Export**: Save, duplicate, or transfer workflow boards cleanly between workspaces.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Usage |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, JavaScript | Logic structure and interactive states |
| **Frontend Build** | Vite 8 | Ultra-fast Hot Module Replacement (HMR) bundler |
| **Styling Engine** | Tailwind CSS v4, Vanilla CSS | Core design variables and hardware-accelerated animations |
| **Graphing Engine** | `@xyflow/react` (React Flow) | Zoomable org node networks and hierarchy canvases |
| **Icons** | Lucide React | High-quality UI icons |
| **Backend Core** | FastAPI (Python 3) | Performance-focused REST APIs with auto-documented OpenAPI |
| **ORM / DB Layer** | SQLAlchemy, SQLite / PostgreSQL | Database relationships, schema models, and transaction locks |
| **Authentication** | Passlib (Bcrypt), Python-Jose | Encrypted credentials and JSON Web Token (JWT) authorizations |
| **Containerization**| Docker, Docker Compose | Multi-container microservice deployments |

---

## 🚀 Getting Started & Local Development

### 1. Prerequisite Installations
Ensure you have the following installed locally:
- [Node.js (v18+)](https://nodejs.org/) & `npm`
- [Python (v3.9+)](https://www.python.org/)
- *Optional:* [Docker Desktop](https://www.docker.com/)

---

### 2. Manual Development Setup (Without Docker)

#### 🔹 Step A: Running the Backend
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Spin up the FastAPI server with live reloading:
   ```bash
   uvicorn main:app --reload
   ```
   *The API will run on:* [http://localhost:8000](http://localhost:8000) (Interactive Swagger docs available at [http://localhost:8000/docs](http://localhost:8000/docs)).  
   *Note: On launch, a local SQLite `local.db` database will be created automatically in the backend directory.*

#### 🔹 Step B: Running the Frontend
1. Open a new terminal window and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite local dev server:
   ```bash
   npm run dev
   ```
   *The web client will load on:* [http://localhost:5173](http://localhost:5173) (or your next available port).

---

### 3. Docker Container Deployment

If you prefer building the services inside Docker containers, launch the multi-container configuration at the repository root:

```bash
docker-compose up -d --build
```
- **Web App Interface**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Endpoint Server**: [http://localhost:8000](http://localhost:8000)
- **PostgreSQL Database Engine**: Runs inside the Docker sandbox on port `5432`.

---

## 👥 Seed Demo Data

Upon initial launch, the backend seeds a mock corporation named **Northstar Systems** (idempotent setup). This demo company includes roughly **25 detailed employees** mapped across admin, CEO, HR, CTO, developers, sales, and marketing roles.

- **Default Seed Password**: `password123`
- **Suggested Admin Account**:
  - **Username**: `admin1`
  - **Password**: `password123`

---

## 🗺️ API Endpoint Surface Map

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user and map them to roles | No |
| `POST` | `/auth/login` | Authenticate details and obtain Bearer JWT | No |
| `GET` | `/auth/me` | Fetch active profile and corporate node info | **Yes** |
| `GET` | `/workflows` | List all active workflow pipelines | **Yes** |
| `POST` | `/workflows` | Create a new board pipeline | **Yes** |
| `GET` | `/workflows/{id}` | Inspect a workflow by ID | **Yes** |
| `PUT` | `/workflows/{id}` | Update workflow fields or archiving settings | **Yes** |
| `DELETE`| `/workflows/{id}` | Delete a workflow template | **Yes** |
| `POST` | `/workflows/{id}/duplicate` | Duplicate an entire template, including stages | **Yes** |
| `POST` | `/workflows/{id}/stages` | Append a stage to a workflow board | **Yes** |
| `PUT` | `/workflows/stages/reorder` | Update stage indexes via drag-and-drop | **Yes** |
| `POST` | `/workflows/stages/{stage_id}/tasks` | Append a task to a specific stage | **Yes** |
| `POST` | `/workflows/{id}/runs` | Launch a sequential workflow run | **Yes** |
| `POST` | `/workflows/runs/{run_id}/tasks/{task_id}/complete` | Complete task and advance active runs | **Yes** |
| `GET` | `/workflows/dashboard/summary` | Fetch analytics card metrics | **Yes** |
| `GET` | `/workflows/{id}/export` | Export workflow config into portable JSON | **Yes** |
| `POST` | `/workflows/import` | Import workflow configuration | **Yes** |

---

## 📂 Repository File Index

```
flowboard/
├── backend/
│   ├── routers/            # Modulized REST routes (auth, workflow, organization)
│   ├── database.py         # SQLAlchemy connection configs
│   ├── main.py             # FastAPI bootstrap application
│   ├── models.py           # Relational schemas & model entities
│   ├── seed.py             # Northstar seed generation logic
│   └── requirements.txt    # Python library requirements
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI primitives & Protected Route wrappers
│   │   │   └── ui/         # Shadcn base elements (button, badge, cards)
│   │   ├── context/        # Auth react contexts & status markers
│   │   ├── pages/          # Full page controllers (Landing, Org, Dashboard)
│   │   ├── App.jsx         # App router routing maps
│   │   └── index.css       # Hardware accelerated Tailwind v4 configs
│   │
│   ├── public/             # Visual PNG mockups
│   └── package.json        # Node dependency package
│
└── docker-compose.yml      # Multi-container environment configs
```

---

## 📄 Licensing & Documentation

For details on cloud production builds, CORS controls, and automated database bootstrapping, consult [DEPLOYMENT.md](DEPLOYMENT.md).
