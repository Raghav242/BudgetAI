from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()


def _get_spent_for_budget(db: Session, user_id: int, category: str, month: int, year: int) -> float:
    from sqlalchemy import and_, func
    start = datetime(year, month, 1)
    end = datetime(year + (1 if month == 12 else 0), (month % 12) + 1, 1)

    q = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == "expense",
        models.Transaction.date >= start,
        models.Transaction.date < end,
    )
    if category != "overall":
        q = q.filter(models.Transaction.category == category)

    return q.scalar() or 0.0


@router.get("", response_model=List[schemas.BudgetWithSpent])
def get_budgets(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.utcnow()
    m, y = month or now.month, year or now.year

    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.month == m,
        models.Budget.year == y,
    ).all()

    result = []
    for b in budgets:
        spent = _get_spent_for_budget(db, current_user.id, b.category, m, y)
        pct = round((spent / b.limit_amount * 100) if b.limit_amount else 0, 1)
        result.append({**b.__dict__, "spent": spent, "percentage": pct})
    return result


@router.post("", response_model=schemas.BudgetOut, status_code=201)
def create_budget(
    data: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.category == data.category,
        models.Budget.month == data.month,
        models.Budget.year == data.year,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Budget for this category/month already exists")

    budget = models.Budget(user_id=current_user.id, **data.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.put("/{budget_id}", response_model=schemas.BudgetOut)
def update_budget(
    budget_id: int,
    data: schemas.BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id,
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if data.limit_amount is not None:
        budget.limit_amount = data.limit_amount
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id,
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
