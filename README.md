# react_devloper_agent
Creating a test web app for testing the Developer Kit


## Task Manager
A two-page task management app: **React (Vite)** frontend on **GitHub Pages**, with **Supabase** (Postgres + auto REST API) as the backend.

Live site: https://mathewleo930-jpg.github.io/react_devloper_agent/

## Project structure

```
frontend/
  src/
    lib/supabase.js             # Supabase client (reads VITE_SUPABASE_* env vars)
    api/tasks.js                # Task queries against Supabase
    pages/Dashboard.jsx         # Page 1: stats + recent tasks + actions
    pages/AddTask.jsx           # Page 2: add task form
    components/StatCard.jsx, TaskTable.jsx, ThemeToggle.jsx
    hooks/useTheme.js           # Theme state, applied to <html> and saved
    theme.js                    # Theme helpers (initial choice, apply, persist)
  .env.example                  # Template for frontend/.env.local
supabase/
  config.toml                   # Supabase CLI config
  migrations/                   # SQL schema: tasks table, task_stats view, RLS policies
.github/workflows/deploy-pages.yml        # Test, build and deploy frontend on push to main
.github/workflows/supabase-migrations.yml # Preview migrations on PRs, apply them on merge to main
backend/                        # Legacy FastAPI + SQLite API; no longer used or deployed
```

## Data model

| Object       | Description                                                       |
|--------------|-------------------------------------------------------------------|
| `tasks`      | `id`, `title` (1-200 chars), `description` (≤2000), `status` (`pending`/`completed`), `created_at` |
| `task_stats` | View with `total`, `pending`, `completed` counts                  |

Row Level Security is on, with open policies: there is no login, so **anyone with the site URL can
add, complete and delete tasks**. Add Supabase Auth and per-user policies before using it for real data.

## Setup

1. **Database:** in Supabase → SQL Editor, run `supabase/migrations/20261009000000_create_tasks.sql` once.
2. **Local env:** copy `frontend/.env.example` to `frontend/.env.local` and fill in the Project URL and
   publishable key (Supabase → Project Settings → Data API / API Keys). `.env*` files are gitignored.
3. **GitHub (one time):**
   - Settings → Pages → Source: **GitHub Actions**.
   - Settings → Secrets and variables → Actions → **Variables**: add `VITE_SUPABASE_URL` and
     `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Database changes

Schema changes go through migration files, not the SQL Editor:

1. Create a file: `npx supabase migration new <name>` (adds `supabase/migrations/<timestamp>_<name>.sql`) and write the SQL.
2. Open a PR. The **Supabase migrations** workflow runs `supabase db push --dry-run` and lists what would be applied.
3. Merge to `main`. The workflow runs `supabase db push`, applying only migrations not yet recorded in the database.

The workflow needs the repo secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD`.
Avoid editing the schema by hand in the dashboard; it makes the database drift from the migration files.

## Running

From `frontend/` (Node ≥ 18):

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # output in frontend/dist, built for the /react_devloper_agent/ path
```

Every push to `main` runs the tests, builds and deploys to GitHub Pages.

## Theme

The **Dark mode** button in the top bar switches between light and dark themes. The choice is saved in
`localStorage` (key `theme`); without a saved choice the app follows the OS `prefers-color-scheme` setting.

The Dashboard's **+ Add Task** button uses the green `btn-add` style (`--add-bg`, `--add-hover-bg` and
`--on-add` in `frontend/src/index.css`), with colours for both themes that keep text contrast at 4.5:1 or higher.
