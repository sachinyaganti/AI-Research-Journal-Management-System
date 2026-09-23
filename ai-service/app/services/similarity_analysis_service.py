import re

from app.models.similarity_analysis import (
    SimilarityMatch,
    SimilarityRequest,
    SimilarityResponse,
)


def normalize_text(text: str) -> set[str]:
    words = re.findall(
        r"\b[a-zA-Z0-9]+\b",
        text.lower(),
    )

    return set(words)


def calculate_similarity(
    text_a: str,
    text_b: str,
) -> float:

    words_a = normalize_text(text_a)
    words_b = normalize_text(text_b)

    if not words_a or not words_b:
        return 0.0

    intersection = words_a.intersection(words_b)
    union = words_a.union(words_b)

    similarity = (
        len(intersection) / len(union)
    ) * 100

    return round(similarity, 2)


def analyze_similarity(
    request: SimilarityRequest,
) -> SimilarityResponse:

    current_text = (
        request.title
        + " "
        + request.abstractText
    )

    matches = []

    for candidate in request.candidates:

        # Do not compare a manuscript with itself.
        if candidate.manuscript_id == request.manuscript_id:
            continue

        candidate_text = (
            candidate.title
            + " "
            + candidate.abstractText
        )

        similarity = calculate_similarity(
            current_text,
            candidate_text,
        )

        if similarity > 0:
            matches.append(
                SimilarityMatch(
                    manuscript_id=candidate.manuscript_id,
                    title=candidate.title,
                    similarity_percentage=similarity,
                )
            )

    matches.sort(
        key=lambda match: match.similarity_percentage,
        reverse=True,
    )

    if not matches:
        return SimilarityResponse(
            manuscript_id=request.manuscript_id,
            similarity_percentage=0.0,
            status="NO_MATCHES",
            matches=[],
        )

    highest_similarity = matches[0].similarity_percentage

    if highest_similarity >= 70:
        status = "HIGH_SIMILARITY"
    elif highest_similarity >= 40:
        status = "MODERATE_SIMILARITY"
    else:
        status = "LOW_SIMILARITY"

    return SimilarityResponse(
        manuscript_id=request.manuscript_id,
        similarity_percentage=highest_similarity,
        status=status,
        matches=matches,
    )