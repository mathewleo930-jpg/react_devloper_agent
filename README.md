# react_devloper_agent
Creating a test web app for testing the Developer Kit


## Task Manager
A two-page task management app: **React (Vite)** frontend + **FastAPI** backend with SQLite.

## Project structure

```
backend/
  app/
    main.py                     # FastAPI app, CORS, router registration
    core/config.py              # Settings (env vars prefixed TASKS_)
    db/database.py              # SQLAlchemy engine, session, init
    models/task.py              # ORM model + TaskStatus enum
    schemas/task.py             # Pydantic request/response schemas
    repositories/task_repository.py  # Data access (DB queries only)
    services/task_service.py    # Business logic
    api/deps.py                 # Dependency wiring (session -> repo -> service)
    api/routes/tasks.py         # HTTP layer (routes, status codes)
  tests/test_tasks.py
frontend/
  src/
    api/tasks.js                # API client
    pages/Dashboard.jsx         # Page 1: stats + recent tasks + actions
    pages/AddTask.jsx           # Page 2: add task form
    components/StatCard.jsx, TaskTable.jsx, ThemeToggle.jsx
    hooks/useTheme.js           # Theme state, applied to <html> and saved
    theme.js                    # Theme helpers (initial choice, apply, persist)
```

## API

| Method | Path                         | Description                  |
|--------|------------------------------|------------------------------|
| GET    | `/api/tasks?limit=N`         | List tasks (newest first)    |
| GET    | `/api/tasks/stats`           | Total / pending / completed  |
| POST   | `/api/tasks`                 | Create task `{title, description?}` |
| PATCH  | `/api/tasks/{id}/complete`   | Mark task completed          |
| DELETE | `/api/tasks/{id}`            | Delete task                  |

Interactive docs: http://127.0.0.1:8000/docs

## Running

Backend (from `backend/`):

```bash
python -m venv .venv
.venv\Scripts\activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
pytest                        # run tests
```

Frontend (from `frontend/`):

```bash
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend on port 8000.

Frontend tests (from `frontend/`, Node ≥ 18):

```bash
npm install
npm test
```

## Theme

The **Dark mode** button in the top bar switches between light and dark themes. The choice is saved in
`localStorage` (key `theme`); without a saved choice the app follows the OS `prefers-color-scheme` setting.

The Dashboard's **+ Add Task** button is green (`.btn-add`, tokens `--add-task-bg`, `--add-task-hover` and
`--on-add-task` in `frontend/src/index.css`), with light and dark variants that both meet 4.5:1 text contrast.
Its tests are `src/pages/Dashboard.test.jsx` and `src/addTaskButton.css.test.js` (run with `npm test` in `frontend/`).
