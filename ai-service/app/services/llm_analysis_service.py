import json
import logging
import os
import re
from pathlib import Path

from dotenv import load_dotenv

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_FILE)

from app.models.manuscript_analysis import ManuscriptAnalysisRequest

logger = logging.getLogger(__name__)


def get_fallback_analysis(request: ManuscriptAnalysisRequest, reason: str) -> dict:
    """
    Safe rule-based fallback evaluation when upstream LLM service is unavailable,
    rate-limited, or unconfigured.
    """
    abstract_lower = (request.abstractText or "").lower()
    word_count = len(re.findall(r"\b\w+\b", request.abstractText or ""))

    has_method = any(
        term in abstract_lower
        for term in ["method", "approach", "algorithm", "design", "experiment", "model", "proposed", "technique"]
    )
    has_results = any(
        term in abstract_lower
        for term in ["result", "performance", "accuracy", "findings", "evaluat", "metric", "show", "achiev", "outperform"]
    )
    has_conclusion = any(
        term in abstract_lower
        for term in ["conclude", "future", "summary", "demonstrate", "implication", "overall"]
    )

    missing = []
    if not has_method:
        missing.append("Methodology description")
    if not has_results:
        missing.append("Quantitative results and evaluation")
    if not has_conclusion:
        missing.append("Concluding summary or future directions")

    suggestions = [
        "Include concrete empirical findings and key evaluation metrics in the abstract.",
        f"Notice: Automated screening fallback generated ({reason})."
    ]

    return {
        "abstract_quality": "GOOD" if word_count >= 150 else ("ADEQUATE" if word_count >= 50 else "NEEDS_IMPROVEMENT"),
        "methodology_quality": "PRESENT" if has_method else "WEAK",
        "results_quality": "PRESENT" if has_results else "WEAK",
        "conclusion_quality": "PRESENT" if has_conclusion else "WEAK",
        "writing_quality": "ADEQUATE",
        "relevance": "HIGH" if len(request.keywords or "") > 3 else "MODERATE",
        "missing_sections": missing,
        "writing_issues": [],
        "suggestions": suggestions,
    }


def analyze_with_llm(request: ManuscriptAnalysisRequest) -> dict:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key or api_key.strip() == "" or api_key.strip() == "your_groq_api_key_here":
        logger.warning("GROQ_API_KEY is missing or placeholder. Using robust fallback analysis.")
        return get_fallback_analysis(request, "GROQ_API_KEY not configured")

    try:
        from groq import Groq
        client = Groq(api_key=api_key, timeout=15.0)

        prompt = f"""
You are an expert academic manuscript reviewer.

Analyze the following research manuscript information.

Title:
{request.title}

Category:
{request.category}

Keywords:
{request.keywords}

Abstract:
{request.abstractText}

Evaluate the manuscript objectively based only on the information provided.

Return ONLY valid JSON with exactly these fields:

{{
  "abstract_quality": "GOOD | ADEQUATE | NEEDS_IMPROVEMENT",
  "methodology_quality": "PRESENT | WEAK",
  "results_quality": "PRESENT | WEAK",
  "conclusion_quality": "PRESENT | WEAK",
  "writing_quality": "GOOD | ADEQUATE | NEEDS_IMPROVEMENT",
  "relevance": "HIGH | MODERATE | LOW | INSUFFICIENT_INFORMATION",
  "missing_sections": [],
  "writing_issues": [],
  "suggestions": []
}}

Rules:
- Do not invent information that is not present in the abstract.
- missing_sections must contain only sections that are genuinely absent or insufficiently represented.
- writing_issues must contain concise, specific issues.
- suggestions must contain practical academic-writing improvements.
- Return JSON only.
"""

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise academic manuscript review assistant. Return valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )

        content = response.choices[0].message.content

        if not content:
            logger.warning("Groq returned empty response. Falling back.")
            return get_fallback_analysis(request, "Empty LLM response")

        # Strip possible markdown fences
        clean_content = content.strip()
        if clean_content.startswith("```"):
            clean_content = re.sub(r"^```(?:json)?\n?", "", clean_content)
            clean_content = re.sub(r"\n?```$", "", clean_content)

        return json.loads(clean_content)

    except Exception as exc:
        logger.error(f"Groq analysis call failed: {exc}. Using fallback analysis.")
        return get_fallback_analysis(request, f"LLM error: {type(exc).__name__}")