# BudgetAI — AI-Powered Personal Finance Tracker

A full-stack budgeting app with AI-generated insights, mobile-first design, and financial health scoring.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend | FastAPI + SQLAlchemy |
| Database | PostgreSQL (Supabase) |
| AI | Google Gemini 1.5 Flash |
| Deploy | Vercel (FE) + Railway (BE) |

---

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your values
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # Set VITE_API_URL
npm run dev
```

App at `http://localhost:5173`

---

## Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret (generate with `openssl rand -hex 32`) |
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `FRONTEND_URL` | Your Vercel URL (for CORS) |

### Frontend `.env.local`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Railway/Render backend URL |

---

## Features

- **Authentication** — Signup/login with JWT, bcrypt passwords
- **Transactions** — Add/edit/delete with search, filter, recurring support
- **Dashboard** — Balance card, income/expense stats, recent transactions
- **Financial Health Score** — 0–100 score based on budgets, savings rate, consistency
- **Budget Tracking** — Per-category monthly budgets with progress bars
- **Savings Goals** — Track goals with progress visualization
- **AI Insights** — Gemini-powered personalized financial analysis
- **Ask AI** — Chat with your financial data as context
- **Charts** — Spending by category (donut) + monthly trends (bar)

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

### Backend → Railway

1. Push to GitHub
2. Create new Railway project from repo
3. Set environment variables
4. Railway auto-detects `Procfile`

### Database → Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string from Settings → Database
3. Set as `DATABASE_URL` in backend `.env`
4. Tables are created automatically on first startup

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
