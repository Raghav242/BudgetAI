import os
import json
import google.generativeai as genai
from typing import Optional

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

_model = None


def _get_model():
    global _model
    if _model is None:
        try:
            # Try gemini-2.0-flash first (latest, available on free tier)
            _model = genai.GenerativeModel("gemini-2.0-flash")
        except Exception as e:
            print(f"gemini-2.0-flash not available: {e}")
            try:
                # Fallback to gemini-pro
                _model = genai.GenerativeModel("gemini-pro")
            except Exception as e2:
                print(f"gemini-pro not available either: {e2}")
                # List available models
                try:
                    models = genai.list_models()
                    available = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
                    print(f"Available models: {available}")
                    if available:
                        _model = genai.GenerativeModel(available[0].split('/')[-1])
                except Exception as e3:
                    print(f"Could not list models: {e3}")
                    raise
    return _model


ANALYZE_PROMPT = """You are a personal finance advisor. Analyze the following financial summary and provide 4-5 concise, actionable insights.

Financial Summary:
{summary}

Respond with a JSON object in this exact format:
{{
  "insights": [
    {{
      "type": "warning|tip|achievement|alert",
      "title": "Short title",
      "message": "One or two sentence insight",
      "icon": "trending_up|warning|lightbulb|check_circle|alert_circle"
    }}
  ],
  "overall_assessment": "One sentence summary of financial health"
}}

Rules:
- Be specific with numbers when available
- Use "warning" for budget issues, "tip" for savings advice, "achievement" for positive trends, "alert" for urgent matters
- Keep messages conversational and actionable
- If monthly_change_percent is positive, warn about increased spending
- If budget_exceeded_categories is non-empty, create alerts for each
- Always include at least one positive/motivating insight"""


ASK_PROMPT = """You are a friendly personal finance advisor with access to the user's financial data.

Financial Context:
{context}

User Question: {question}

Answer in 2-4 sentences. Be specific, using the financial data when relevant. Be encouraging but honest.
Do not use markdown formatting. Just plain conversational text."""


def analyze_finances(summary: dict) -> dict:
    try:
        prompt = ANALYZE_PROMPT.format(summary=json.dumps(summary, indent=2))
        response = _get_model().generate_content(prompt)
        text = response.text.strip()

        # Extract JSON from response
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        return json.loads(text)
    except Exception as e:
        print(f"AI Analyze Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "insights": [
                {
                    "type": "tip",
                    "title": "AI Analysis Unavailable",
                    "message": "Unable to generate AI insights at the moment. Check your API key configuration.",
                    "icon": "alert_circle",
                }
            ],
            "overall_assessment": "Manual review recommended.",
            "error": str(e),
        }


def ask_question(question: str, context: Optional[dict] = None) -> str:
    try:
        ctx_str = json.dumps(context, indent=2) if context else "No financial data available."
        prompt = ASK_PROMPT.format(context=ctx_str, question=question)
        response = _get_model().generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"AI Ask Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"I'm unable to answer your question right now. Please try again later. (Error: {str(e)})"
