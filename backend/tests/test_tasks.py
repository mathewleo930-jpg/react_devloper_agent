import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_create_and_list(client):
    r = client.post("/api/tasks", json={"title": "  Write docs ", "description": ""})
    assert r.status_code == 201
    body = r.json()
    assert body["title"] == "Write docs"
    assert body["description"] is None
    assert body["status"] == "pending"
    assert body["created_at"].endswith("+00:00")

    r = client.get("/api/tasks")
    assert [t["id"] for t in r.json()] == [body["id"]]


def test_title_required(client):
    assert client.post("/api/tasks", json={"title": "   "}).status_code == 422
    assert client.post("/api/tasks", json={}).status_code == 422


def test_complete_delete_and_stats(client):
    a = client.post("/api/tasks", json={"title": "A"}).json()
    client.post("/api/tasks", json={"title": "B"})

    r = client.patch(f"/api/tasks/{a['id']}/complete")
    assert r.status_code == 200 and r.json()["status"] == "completed"
    assert client.get("/api/tasks/stats").json() == {"total": 2, "pending": 1, "completed": 1}

    assert client.delete(f"/api/tasks/{a['id']}").status_code == 204
    assert client.get("/api/tasks/stats").json() == {"total": 1, "pending": 1, "completed": 0}


def test_not_found(client):
    assert client.patch("/api/tasks/999/complete").status_code == 404
    assert client.delete("/api/tasks/999").status_code == 404
