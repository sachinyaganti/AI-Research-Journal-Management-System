import json
import os

from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_FILE)

from app.models.manuscript_analysis import (
    ManuscriptAnalysisRequest,
)


def analyze_with_llm(
    request: ManuscriptAnalysisRequest,
) -> dict:

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY environment variable is not configured"
        )

    client = Groq(api_key=api_key)

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
                "content": (
                    "You are a precise academic manuscript "
                    "review assistant. Return valid JSON only."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "LLM returned an empty response"
        )

    return json.loads(content)