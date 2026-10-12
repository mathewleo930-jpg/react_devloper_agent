# react_devloper_agent
Creating a test web app for testing the Developer Kit


## Deskline helpdesk
A helpdesk ticketing app: **React (Vite)** frontend on **GitHub Pages**, with optional **Supabase** (Postgres + auto REST API) as the backend.

Live site: https://mathewleo930-jpg.github.io/react_devloper_agent/

- [How it works](docs/HOW-IT-WORKS.md): frontend, Supabase backend and the request flow
- [Deployment](docs/DEPLOYMENT.md): both GitHub Actions workflows and how to ship changes

## Pages

| Route | Page | What it does |
|-------|------|--------------|
| `#/` | Landing | Product page: hero, features, how it works, pricing, FAQ, links into the app |
| `#/app` | Overview | Key metrics (open, unassigned, SLA breached, first response, solved this week), 7-day volume, status breakdown, tickets needing attention, team workload, latest activity |
| `#/app/tickets` | Tickets | View tabs (Open, My tickets, Unassigned, Urgent, Pending, Solved, All), search, priority/assignee/category filters, sorting, bulk assign and bulk status change |
| `#/app/tickets/:id` | Ticket detail | Conversation and activity tabs, public replies and internal notes, canned replies, editable status/priority/assignee/category, customer card with their other tickets |
| `#/app/tickets/new` | New ticket | Customer, subject, description (with character counters), priority, category, channel, assignee |
| `#/app/board` | Board | Kanban columns per status; drag a card, or use its status menu, to move it |
| `#/app/customers` | Customers | Plan tabs, search, open and total ticket counts, latest ticket |
| `#/app/team` | Team | Agent cards with presence, open/solved counts, CSAT and workload |
| `#/app/reports` | Reports | Date range, response and resolution times, SLA compliance, volume by category/channel/priority, agent leaderboard |
| `#/app/settings` | Settings | General, SLA policies, notifications, data source and demo reset |

Each priority has a resolution target (Urgent 4h, High 8h, Medium 24h, Low 72h). Open tickets show the time left,
turn amber with under 25% left and red once overdue.

## Data: demo mode or Supabase

The app picks its data source from the environment:

- **Demo mode** (no `VITE_SUPABASE_*` variables): starts with the sample workspace in `src/data/mockData.js`
  and saves every change to `localStorage` (key `deskline:v1`). Settings → Data → **Reset** restores the samples.
- **Supabase** (both variables set): loads agents, customers and tickets from the database. Each change shows
  on screen straight away, then the changed ticket, its new messages and its new activity are written. If a write
  fails, a toast says so and the workspace reloads from the database.

The top bar shows **Demo data** or **Live** so you can tell which mode is active.

## Project structure

```
frontend/
  src/
    App.jsx                     # Routes: landing at /, the app under /app
    layouts/AppLayout.jsx       # Sidebar, top bar with global search, loading/error states
    pages/                      # Landing, Overview, Tickets, TicketDetail, NewTicket, Board, Customers, Team, Reports, Settings
    components/                 # Icon, Avatar, Badges (status/priority/SLA), Charts, ThemeToggle, CharCounter
    store/ticketReducer.js      # Pure state changes: create, update, bulk update, reply, reset
    store/TicketStore.jsx       # Context provider: local or Supabase persistence, toasts
    api/tickets.js              # Supabase queries and row ↔ ticket mapping
    data/constants.js           # Statuses, priorities and SLA hours, categories, channels, product name
    data/mockData.js            # Demo agents, customers and tickets
    lib/format.js               # Relative times, durations, initials, SLA state
    lib/supabase.js             # Supabase client, or null in demo mode
    hooks/useTheme.js, theme.js # Light/dark theme, saved in localStorage
    charLimit.js                # Subject/description limits for the counters
  .env.example                  # Template for frontend/.env.local
supabase/
  migrations/                   # SQL schema and demo seed
.github/workflows/              # Pages deploy and Supabase migrations
```

## Data model

| Table             | Columns |
|-------------------|---------|
| `agents`          | `id`, `name`, `email`, `role`, `team`, `presence` (`online`/`away`/`offline`), `csat` (0–100) |
| `customers`       | `id`, `name`, `email`, `company`, `plan` (`Starter`/`Business`/`Enterprise`), `location` |
| `tickets`         | `number` (shown as `TCK-<number>`), `subject` (1–200), `status` (`open`/`in_progress`/`pending`/`resolved`/`closed`), `priority` (`low`/`medium`/`high`/`urgent`), `category`, `channel`, `customer_id`, `assignee_id`, `tags`, `created_at`, `updated_at`, `first_response_at` |
| `ticket_messages` | `ticket_no`, `author` (`customer`/`agent`), `author_id`, `body`, `internal`, `created_at` |
| `ticket_activity` | `ticket_no`, `text`, `created_at` |

Migrations `20261012000000_ticketing.sql` (schema) and `20261012000100_ticketing_demo_seed.sql` (the same sample
workspace as demo mode, with timestamps relative to when it runs) add these tables. The older `tasks` table is left
in place but no longer used by the frontend.

Row Level Security is on, with open policies: there is no login, so **anyone with the site URL can read tickets and
create or update them**. Messages and activity are append-only. Add Supabase Auth and per-user policies before
using this for real data. The signed-in agent is fixed to `a1` (Priya Nair) until then.

## Setup

1. **Database:** applied automatically by the **Supabase migrations** workflow (see [Deployment](docs/DEPLOYMENT.md)).
2. **Local env (optional):** copy `frontend/.env.example` to `frontend/.env.local` and fill in the Project URL and
   publishable key (Supabase → Project Settings → Data API / API Keys). Skip this to run in demo mode. `.env*` files are gitignored.
3. **GitHub (one time):**
   - Settings → Pages → Source: **GitHub Actions**.
   - Settings → Secrets and variables → Actions → **Variables**: add `VITE_SUPABASE_URL` and
     `VITE_SUPABASE_PUBLISHABLE_KEY` (leave them out to deploy in demo mode).
   - Settings → Secrets and variables → Actions → **Secrets**: add `SUPABASE_DB_URL`.

## Database changes

Schema changes go through migration files, not the SQL Editor:

1. Create a file: `npx supabase migration new <name>` (adds `supabase/migrations/<timestamp>_<name>.sql`) and write the SQL.
2. Open a PR. The **Supabase migrations** workflow runs `supabase db push --dry-run` and lists what would be applied.
3. Merge to `main`. The workflow runs `supabase db push`, applying only migrations not yet recorded in the database.

The workflow needs one repo secret, `SUPABASE_DB_URL`: the Session pooler connection string
from Supabase → Connect (URL-encode special characters in the password).
Avoid editing the schema by hand in the dashboard; it makes the database drift from the migration files.

## Running

From `frontend/` (Node ≥ 18):

```bash
npm install
npm run dev      # http://localhost:5173 (app: /#/app)
npm test         # Vitest unit tests
npm run build    # output in frontend/dist, built for the /react_devloper_agent/ path
```

Every push to `main` runs the tests, builds and deploys to GitHub Pages.

## Branding

The product name lives in `APP_NAME` in `frontend/src/data/constants.js`. The logo is `frontend/public/logo.svg`,
used in the sidebar, the landing page and as the browser tab icon. The current file is a **placeholder**: overwrite
it with the official SVG under the same name, keeping a `viewBox` and colours that read on light and dark backgrounds.

## Diwali offer

The landing page shows a Diwali banner and 10% off paid plans (Business: ~~$29~~ $26.10). The offer lives in
`frontend/src/data/promotion.js`; set `DIWALI_PROMO` to `null` to switch both off. Photo credits are in `CREDITS.md`.

## Theme

The theme switch in the top bar toggles light and dark. The choice is saved in `localStorage` (key `theme`);
without one the app follows the OS `prefers-color-scheme` setting. Colours are tokens on `:root` in
`frontend/src/index.css`, redefined under `:root[data-theme='dark']`.
