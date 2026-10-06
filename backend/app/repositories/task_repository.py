from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus


class TaskRepository:
    """Data-access layer: the only place that talks to the database."""

    def __init__(self, db: Session):
        self.db = db

    def list(self, limit: int | None = None) -> list[Task]:
        stmt = select(Task).order_by(Task.created_at.desc(), Task.id.desc())
        if limit is not None:
            stmt = stmt.limit(limit)
        return list(self.db.scalars(stmt))

    def get(self, task_id: int) -> Task | None:
        return self.db.get(Task, task_id)

    def create(self, title: str, description: str | None) -> Task:
        task = Task(title=title, description=description)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update_status(self, task: Task, status: TaskStatus) -> Task:
        task.status = status
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()

    def count_by_status(self) -> dict[TaskStatus, int]:
        rows = self.db.execute(select(Task.status, func.count()).group_by(Task.status)).all()
        return {status: count for status, count in rows}
