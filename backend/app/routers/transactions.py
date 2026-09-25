from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
from datetime import datetime
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[schemas.TransactionOut])
def get_transactions(
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    )

    if type:
        query = query.filter(models.Transaction.type == type)
    if category:
        query = query.filter(models.Transaction.category == category)
    if month and year:
        query = query.filter(
            and_(
                models.Transaction.date >= datetime(year, month, 1),
                models.Transaction.date < datetime(year + (1 if month == 12 else 0), (month % 12) + 1, 1),
            )
        )
    elif year:
        query = query.filter(
            and_(
                models.Transaction.date >= datetime(year, 1, 1),
                models.Transaction.date < datetime(year + 1, 1, 1),
            )
        )
    if search:
        query = query.filter(
            models.Transaction.notes.ilike(f"%{search}%") |
            models.Transaction.category.ilike(f"%{search}%")
        )

    return query.order_by(models.Transaction.date.desc()).offset(offset).limit(limit).all()


@router.post("", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(
    data: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    transaction = models.Transaction(
        user_id=current_user.id,
        amount=data.amount,
        category=data.category,
        type=data.type,
        date=data.date or datetime.utcnow(),
        notes=data.notes,
        is_recurring=data.is_recurring,
        recurring_interval=data.recurring_interval,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.put("/{transaction_id}", response_model=schemas.TransactionOut)
def update_transaction(
    transaction_id: int,
    data: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(transaction)
    db.commit()
