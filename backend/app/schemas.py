from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str]
    currency: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class UserUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None


# ── Transactions ──────────────────────────────────────────────────────────────

class TransactionCreate(BaseModel):
    amount: float
    category: str
    type: str  # income | expense
    date: Optional[datetime] = None
    notes: Optional[str] = None
    is_recurring: bool = False
    recurring_interval: Optional[str] = None  # monthly | weekly | yearly


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    type: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurring_interval: Optional[str] = None


class TransactionOut(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    type: str
    date: datetime
    notes: Optional[str]
    is_recurring: bool
    recurring_interval: Optional[str]

    model_config = {"from_attributes": True}


# ── Budgets ───────────────────────────────────────────────────────────────────

class BudgetCreate(BaseModel):
    category: str
    limit_amount: float
    month: int
    year: int


class BudgetUpdate(BaseModel):
    limit_amount: Optional[float] = None


class BudgetOut(BaseModel):
    id: int
    user_id: int
    category: str
    limit_amount: float
    month: int
    year: int

    model_config = {"from_attributes": True}


class BudgetWithSpent(BudgetOut):
    spent: float
    percentage: float


# ── Savings Goals ─────────────────────────────────────────────────────────────

class SavingsGoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[datetime] = None


class SavingsGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[datetime] = None


class SavingsGoalOut(BaseModel):
    id: int
    user_id: int
    name: str
    target_amount: float
    current_amount: float
    deadline: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── AI ────────────────────────────────────────────────────────────────────────

class AIAskRequest(BaseModel):
    question: str
    include_context: bool = True


class AIAnalyzeRequest(BaseModel):
    month: Optional[int] = None
    year: Optional[int] = None
