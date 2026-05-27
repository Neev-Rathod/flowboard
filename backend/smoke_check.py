from main import app
from models import Base


def assert_route(path: str) -> None:
    for route in app.routes:
        if getattr(route, "path", None) == path:
            return
    raise AssertionError(f"Missing route: {path}")


def main() -> None:
    required_routes = [
        "/health",
        "/auth/register",
        "/auth/login",
        "/auth/me",
        "/organization/tree",
        "/organization/users",
        "/workflows/",
        "/workflows/{workflow_id}/board",
        "/workflows/{workflow_id}/tasks/{task_id}/complete",
        "/workflows/dashboard/summary",
    ]
    for route_path in required_routes:
        assert_route(route_path)

    required_tables = {
        "users",
        "workflows",
        "workflow_stages",
        "tasks",
    }
    missing_tables = required_tables.difference(Base.metadata.tables.keys())
    if missing_tables:
        raise AssertionError(f"Missing tables: {sorted(missing_tables)}")

    print("Smoke check passed.")


if __name__ == "__main__":
    main()
