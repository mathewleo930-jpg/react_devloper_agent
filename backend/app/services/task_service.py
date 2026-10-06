from app.models.task import Task, TaskStatus
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskStats


class TaskNotFoundError(Exception):
    def __init__(self, task_id: int):
        super().__init__(f"Task {task_id} not found")
        self.task_id = task_id


class TaskService:
    """Business-logic layer: independent of HTTP and of storage details."""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def list_tasks(self, limit: int | None = None) -> list[Task]:
        return self.repository.list(limit)

    def create_task(self, data: TaskCreate) -> Task:
        return self.repository.create(title=data.title, description=data.description)

    def complete_task(self, task_id: int) -> Task:
        task = self._get_or_raise(task_id)
        if task.status == TaskStatus.completed:
            return task
        return self.repository.update_status(task, TaskStatus.completed)

    def delete_task(self, task_id: int) -> None:
        self.repository.delete(self._get_or_raise(task_id))

    def get_stats(self) -> TaskStats:
        counts = self.repository.count_by_status()
        pending = counts.get(TaskStatus.pending, 0)
        completed = counts.get(TaskStatus.completed, 0)
        return TaskStats(total=pending + completed, pending=pending, completed=completed)

    def _get_or_raise(self, task_id: int) -> Task:
        task = self.repository.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task
