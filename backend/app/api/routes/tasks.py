from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_task_service
from app.schemas.task import TaskCreate, TaskRead, TaskStats
from app.services.task_service import TaskNotFoundError, TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
def list_tasks(
    limit: int | None = Query(default=None, ge=1, le=500),
    service: TaskService = Depends(get_task_service),
):
    return service.list_tasks(limit)


@router.get("/stats", response_model=TaskStats)
def get_stats(service: TaskService = Depends(get_task_service)):
    return service.get_stats()


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, service: TaskService = Depends(get_task_service)):
    return service.create_task(payload)


@router.patch("/{task_id}/complete", response_model=TaskRead)
def complete_task(task_id: int, service: TaskService = Depends(get_task_service)):
    try:
        return service.complete_task(task_id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, service: TaskService = Depends(get_task_service)):
    try:
        service.delete_task(task_id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
