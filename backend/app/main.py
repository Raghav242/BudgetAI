from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from .database import engine, Base
from .routers import auth, transactions, budgets, insights, ai, savings


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="BudgetAI API",
    version="1.0.0",
    description="AI-powered personal budgeting API",
    lifespan=lifespan,
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
app.include_router(savings.router, prefix="/savings", tags=["Savings"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])


@app.get("/")
def root():
    return {"message": "BudgetAI API", "status": "running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
