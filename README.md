# BudgetAI — AI-Powered Personal Finance Tracker

BudgetAI is a mobile-first budgeting app that helps you understand where your money goes. You log income and expenses, set monthly budgets per category, and track savings goals. The app turns that data into a **financial health score from 0 to 100** and uses **Google Gemini** to write personalized insights and answer questions about your finances.

---

## What It Does

- **Track transactions:** add, edit, search and filter income and expenses, including recurring ones
- **Budget by category:** set monthly limits and watch progress bars fill as you spend
- **Save toward goals:** create savings goals and see how close you are
- **Get a health score:** a 0–100 score made up of budget adherence (40 pts), savings rate (30 pts) and spending consistency (30 pts)
- **AI insights:** Gemini reads your monthly summary and suggests where you can improve
- **Ask AI:** chat with an assistant that uses your own financial data as context
- **Visualize spending:** a donut chart of spending by category and a bar chart of monthly trends

---

## Tech Stack

| Layer    | Tech                                      |
| -------- | ----------------------------------------- |
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend  | FastAPI + SQLAlchemy                      |
| Database | PostgreSQL (Supabase), SQLite for local dev |
| AI       | Google Gemini                             |
| Auth     | JWT + bcrypt                              |
| Deploy   | Vercel (FE) + Railway (BE)                |

---

## API Reference

```
POST  /auth/signup          Create account
POST  /auth/login           Login
GET   /auth/me              Get current user
PATCH /auth/me              Update profile

GET   /transactions         List (filter by type/category/month)
POST  /transactions         Create
PUT   /transactions/{id}    Update
DELETE /transactions/{id}   Delete

GET   /budgets              List budgets with spent amounts
POST  /budgets              Create budget
PUT   /budgets/{id}         Update limit
DELETE /budgets/{id}        Delete

GET   /savings              List goals
POST  /savings              Create goal
PUT   /savings/{id}         Update goal
DELETE /savings/{id}        Delete

GET   /insights/summary     Monthly financial summary
GET   /insights/charts      Chart data (categories + trends)
GET   /insights/health-score  Financial health score (0-100)

POST  /ai/analyze           Generate AI insights for current month
POST  /ai/ask               Ask AI a question with financial context
```

---

## Running Locally

You need Python 3.10+, Node 18+, and a [Gemini API key](https://aistudio.google.com/app/apikey).

**Backend** (runs at `http://localhost:8000`, API docs at `/docs`):

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # set SECRET_KEY and GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

If you leave `DATABASE_URL` unset, the backend uses a local SQLite file. Tables are created automatically on first startup.

**Frontend** (runs at `http://localhost:5173`):

```bash
cd frontend
npm install
cp .env.example .env.local      # set VITE_API_URL=http://localhost:8000
npm run dev
```

**Deploying:** the frontend goes to Vercel (set `VITE_API_URL`) and the backend goes to Railway, which picks up the `Procfile` (set `DATABASE_URL` to your Supabase connection string, plus `SECRET_KEY`, `GEMINI_API_KEY` and `FRONTEND_URL` for CORS).
