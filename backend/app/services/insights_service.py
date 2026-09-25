from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from collections import defaultdict
from typing import List
from .. import models
import statistics


DEFAULT_CATEGORIES = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment",
    "Housing", "Healthcare", "Education", "Utilities",
    "Personal Care", "Travel", "Investment", "Other",
]


def get_month_range(year: int, month: int):
    start = datetime(year, month, 1)
    if month == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month + 1, 1)
    return start, end


def get_transactions_for_month(db: Session, user_id: int, year: int, month: int):
    start, end = get_month_range(year, month)
    return db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.date >= start,
        models.Transaction.date < end,
    ).all()


def compute_category_breakdown(transactions: list) -> dict:
    breakdown = defaultdict(float)
    for t in transactions:
        if t.type == "expense":
            breakdown[t.category] += t.amount
    return dict(sorted(breakdown.items(), key=lambda x: x[1], reverse=True))


def compute_monthly_trends(db: Session, user_id: int, months: int = 6) -> List[dict]:
    now = datetime.utcnow()
    result = []
    for i in range(months - 1, -1, -1):
        month = ((now.month - 1 - i) % 12) + 1
        year = now.year - ((now.month - 1 - i) // 12 + (1 if (now.month - 1 - i) < 0 else 0))
        if month <= 0:
            month += 12
            year -= 1

        txns = get_transactions_for_month(db, user_id, year, month)
        income = sum(t.amount for t in txns if t.type == "income")
        expenses = sum(t.amount for t in txns if t.type == "expense")
        result.append({
            "month": datetime(year, month, 1).strftime("%b %Y"),
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "savings": round(income - expenses, 2),
        })
    return result


def compute_financial_summary(db: Session, user_id: int, year: int, month: int) -> dict:
    txns = get_transactions_for_month(db, user_id, year, month)
    prev_month = month - 1 if month > 1 else 12
    prev_year = year if month > 1 else year - 1
    prev_txns = get_transactions_for_month(db, user_id, prev_year, prev_month)

    income = sum(t.amount for t in txns if t.type == "income")
    expenses = sum(t.amount for t in txns if t.type == "expense")
    prev_expenses = sum(t.amount for t in prev_txns if t.type == "expense")

    category_breakdown = compute_category_breakdown(txns)
    top_category = max(category_breakdown, key=category_breakdown.get) if category_breakdown else None

    monthly_change_pct = None
    if prev_expenses > 0:
        monthly_change_pct = round((expenses - prev_expenses) / prev_expenses * 100, 1)

    # Weekend vs weekday spending
    weekend_spending = sum(t.amount for t in txns if t.type == "expense" and t.date.weekday() >= 5)
    weekday_spending = sum(t.amount for t in txns if t.type == "expense" and t.date.weekday() < 5)
    weekend_ratio = round(weekend_spending / weekday_spending, 2) if weekday_spending > 0 else None

    # Budget adherence
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.month == month,
        models.Budget.year == year,
    ).all()

    exceeded_categories = []
    for b in budgets:
        if b.category == "overall":
            if expenses > b.limit_amount:
                exceeded_categories.append("overall")
        else:
            cat_spent = category_breakdown.get(b.category, 0)
            if cat_spent > b.limit_amount:
                exceeded_categories.append(b.category)

    savings_rate = round((income - expenses) / income * 100, 1) if income > 0 else 0

    return {
        "total_income": round(income, 2),
        "total_spent": round(expenses, 2),
        "net_savings": round(income - expenses, 2),
        "savings_rate": savings_rate,
        "top_category": top_category,
        "top_category_amount": round(category_breakdown.get(top_category, 0), 2) if top_category else 0,
        "monthly_change_percent": monthly_change_pct,
        "budget_exceeded_categories": exceeded_categories,
        "weekend_spending_ratio": weekend_ratio,
        "category_breakdown": {k: round(v, 2) for k, v in category_breakdown.items()},
        "transaction_count": len(txns),
    }


def compute_health_score(db: Session, user_id: int) -> dict:
    now = datetime.utcnow()
    txns_3m = []
    for i in range(3):
        month = ((now.month - 1 - i) % 12) + 1
        year = now.year - ((now.month - 1 - i) // 12 + (1 if (now.month - 1 - i) < 0 else 0))
        txns_3m.extend(get_transactions_for_month(db, user_id, year, month))

    txns_current = get_transactions_for_month(db, user_id, now.year, now.month)
    income_current = sum(t.amount for t in txns_current if t.type == "income")
    expenses_current = sum(t.amount for t in txns_current if t.type == "expense")

    # 1. Budget adherence score (0–40)
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.month == now.month,
        models.Budget.year == now.year,
    ).all()

    budget_score = 20  # default if no budgets set
    if budgets:
        category_breakdown = compute_category_breakdown(txns_current)
        good = 0
        for b in budgets:
            spent = expenses_current if b.category == "overall" else category_breakdown.get(b.category, 0)
            if spent <= b.limit_amount:
                good += 1
            elif spent <= b.limit_amount * 1.1:
                good += 0.5
        budget_score = round((good / len(budgets)) * 40)

    # 2. Savings rate score (0–30)
    if income_current > 0:
        savings_rate = (income_current - expenses_current) / income_current
        if savings_rate >= 0.20:
            savings_score = 30
        elif savings_rate >= 0.10:
            savings_score = 20
        elif savings_rate >= 0.05:
            savings_score = 12
        elif savings_rate > 0:
            savings_score = 5
        else:
            savings_score = 0
    else:
        savings_score = 0

    # 3. Spending consistency score (0–30)
    monthly_expenses = defaultdict(float)
    for t in txns_3m:
        if t.type == "expense":
            key = (t.date.year, t.date.month)
            monthly_expenses[key] += t.amount

    if len(monthly_expenses) >= 2:
        values = list(monthly_expenses.values())
        mean = statistics.mean(values)
        cv = statistics.stdev(values) / mean if mean > 0 else 1.0
        if cv <= 0.1:
            consistency_score = 30
        elif cv <= 0.2:
            consistency_score = 25
        elif cv <= 0.3:
            consistency_score = 18
        elif cv <= 0.5:
            consistency_score = 10
        else:
            consistency_score = 5
    else:
        consistency_score = 15  # not enough data

    total = budget_score + savings_score + consistency_score

    if total >= 80:
        grade, label = "A", "Excellent"
    elif total >= 65:
        grade, label = "B", "Good"
    elif total >= 50:
        grade, label = "C", "Fair"
    elif total >= 35:
        grade, label = "D", "Needs Improvement"
    else:
        grade, label = "F", "Critical"

    return {
        "score": total,
        "grade": grade,
        "label": label,
        "breakdown": {
            "budget_adherence": budget_score,
            "savings_rate": savings_score,
            "spending_consistency": consistency_score,
        },
    }
