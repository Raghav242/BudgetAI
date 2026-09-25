from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database import get_db
from .. import models
from ..auth import get_current_user
from ..services import insights_service

router = APIRouter()


@router.get("/summary")
def get_summary(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.utcnow()
    m, y = month or now.month, year or now.year
    return insights_service.compute_financial_summary(db, current_user.id, y, m)


@router.get("/charts")
def get_charts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.utcnow()
    category_breakdown = insights_service.compute_category_breakdown(
        insights_service.get_transactions_for_month(db, current_user.id, now.year, now.month)
    )
    monthly_trends = insights_service.compute_monthly_trends(db, current_user.id, months=6)

    return {
        "category_breakdown": [
            {"name": k, "value": round(v, 2)} for k, v in category_breakdown.items()
        ],
        "monthly_trends": monthly_trends,
        "categories": insights_service.DEFAULT_CATEGORIES,
    }


@router.get("/health-score")
def get_health_score(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return insights_service.compute_health_score(db, current_user.id)
