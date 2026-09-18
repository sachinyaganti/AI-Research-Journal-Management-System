import re

from app.models.manuscript_analysis import (
    ManuscriptAnalysisRequest,
    ManuscriptAnalysisResponse,
)


def analyze_manuscript(
    request: ManuscriptAnalysisRequest,
) -> ManuscriptAnalysisResponse:

    abstract_words = re.findall(
        r"\b[\w'-]+\b",
        request.abstractText,
    )

    abstract_word_count = len(abstract_words)

    keywords = [
        keyword.strip()
        for keyword in request.keywords.split(",")
        if keyword.strip()
    ]

    keyword_count = len(keywords)

    abstract_lower = request.abstractText.lower()

    suggestions = []
    missing_sections = []
    writing_issues = []

    # --------------------------------------------------
    # Abstract quality
    # --------------------------------------------------

    if abstract_word_count < 100:
        abstract_quality = "NEEDS_IMPROVEMENT"
        suggestions.append(
            "The abstract is short. Consider including the "
            "research problem, methodology, results, and conclusion."
        )
    elif abstract_word_count < 250:
        abstract_quality = "ADEQUATE"
    else:
        abstract_quality = "GOOD"

    # --------------------------------------------------
    # Methodology analysis
    # --------------------------------------------------

    methodology_terms = [
        "method",
        "methodology",
        "approach",
        "algorithm",
        "experiment",
        "experimental",
        "dataset",
        "data",
        "model",
        "framework",
    ]

    has_methodology = any(
        term in abstract_lower
        for term in methodology_terms
    )

    if has_methodology:
        methodology_quality = "PRESENT"
    else:
        methodology_quality = "WEAK"
        missing_sections.append("Methodology")
        suggestions.append(
            "The abstract may not clearly describe the "
            "research methodology or approach."
        )

    # --------------------------------------------------
    # Results analysis
    # --------------------------------------------------

    result_terms = [
        "result",
        "results",
        "finding",
        "findings",
        "accuracy",
        "performance",
        "evaluation",
        "improvement",
        "achieved",
    ]

    has_results = any(
        term in abstract_lower
        for term in result_terms
    )

    if has_results:
        results_quality = "PRESENT"
    else:
        results_quality = "WEAK"
        missing_sections.append("Results")
        suggestions.append(
            "The abstract may not clearly describe research "
            "results, findings, or evaluation."
        )

    # --------------------------------------------------
    # Conclusion analysis
    # --------------------------------------------------

    conclusion_terms = [
        "conclusion",
        "conclude",
        "future work",
        "implication",
        "implications",
        "therefore",
        "overall",
    ]

    has_conclusion = any(
        term in abstract_lower
        for term in conclusion_terms
    )

    if has_conclusion:
        conclusion_quality = "PRESENT"
    else:
        conclusion_quality = "WEAK"
        missing_sections.append("Conclusion")
        suggestions.append(
            "Consider adding a clear conclusion or statement "
            "of implications."
        )

    # --------------------------------------------------
    # Keyword analysis
    # --------------------------------------------------

    if keyword_count == 0:
        suggestions.append(
            "Add relevant keywords to improve manuscript discoverability."
        )
    elif keyword_count < 3:
        suggestions.append(
            "Consider adding more relevant keywords."
        )
    elif keyword_count > 8:
        suggestions.append(
            "Consider reducing the number of keywords to "
            "the most relevant terms."
        )

    # --------------------------------------------------
    # Category analysis
    # --------------------------------------------------

    if not request.category.strip():
        suggestions.append(
            "Specify a research category."
        )

    # --------------------------------------------------
    # Title analysis
    # --------------------------------------------------

    title_words = re.findall(
        r"\b[\w'-]+\b",
        request.title,
    )

    if len(title_words) < 4:
        writing_issues.append(
            "The title may be too short or insufficiently descriptive."
        )
    elif len(title_words) > 20:
        writing_issues.append(
            "The title may be too lengthy."
        )

    # --------------------------------------------------
    # Writing quality
    # --------------------------------------------------

    sentences = re.split(
        r"[.!?]+",
        request.abstractText.strip(),
    )

    sentences = [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]

    if sentences:
        average_sentence_length = (
            abstract_word_count / len(sentences)
        )

        if average_sentence_length > 35:
            writing_issues.append(
                "Some sentences may be lengthy. Consider "
                "using shorter and clearer sentences."
            )

    if writing_issues:
        writing_quality = "NEEDS_IMPROVEMENT"
    else:
        writing_quality = "ADEQUATE"

    # --------------------------------------------------
    # Research relevance
    # --------------------------------------------------

    if request.category.strip() and keyword_count > 0:
        relevance = "BASIC_RELEVANCE_DETECTED"
    else:
        relevance = "INSUFFICIENT_INFORMATION"

    # --------------------------------------------------
    # Final suggestions
    # --------------------------------------------------

    if not suggestions:
        suggestions.append(
            "The manuscript passed the baseline automated checks."
        )

    return ManuscriptAnalysisResponse(
        title=request.title,
        category=request.category,
        abstract_word_count=abstract_word_count,
        keyword_count=keyword_count,
        abstract_quality=abstract_quality,
        methodology_quality=methodology_quality,
        results_quality=results_quality,
        conclusion_quality=conclusion_quality,
        writing_quality=writing_quality,
        relevance=relevance,
        missing_sections=missing_sections,
        writing_issues=writing_issues,
        suggestions=suggestions,
    )