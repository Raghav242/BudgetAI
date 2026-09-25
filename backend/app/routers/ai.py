from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user
from ..services import ai_service, insights_service

router = APIRouter()


@router.post("/analyze")
def analyze(
    data: schemas.AIAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.utcnow()
    m, y = data.month or now.month, data.year or now.year
    summary = insights_service.compute_financial_summary(db, current_user.id, y, m)
    return ai_service.analyze_finances(summary)


@router.post("/ask")
def ask(
    data: schemas.AIAskRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    context = None
    if data.include_context:
        now = datetime.utcnow()
        context = insights_service.compute_financial_summary(db, current_user.id, now.year, now.month)
        context["health_score"] = insights_service.compute_health_score(db, current_user.id)

    response = ai_service.ask_question(data.question, context)
    return {"response": response, "question": data.question}
