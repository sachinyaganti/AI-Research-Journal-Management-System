import re

from app.models.similarity_analysis import (
    SimilarityMatch,
    SimilarityRequest,
    SimilarityResponse,
)

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
}


def normalize_text(text: str) -> set[str]:
    """
    Extract significant normalized words, excluding common stopwords.
    """
    if not text:
        return set()

    words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
    substantive_words = {w for w in words if w not in STOPWORDS}
    return substantive_words


def calculate_similarity(text_a: str, text_b: str) -> float:
    """
    Calculates Jaccard overlap on substantive terms.
    """
    words_a = normalize_text(text_a)
    words_b = normalize_text(text_b)

    if not words_a or not words_b:
        return 0.0

    intersection = words_a.intersection(words_b)
    union = words_a.union(words_b)

    if not union:
        return 0.0

    similarity = (len(intersection) / len(union)) * 100
    return round(similarity, 2)


def analyze_similarity(request: SimilarityRequest) -> SimilarityResponse:
    # Prefer complete extracted text when available, fallback to title + abstract
    if request.full_text and len(request.full_text.strip()) > 50:
        current_text = request.full_text
    else:
        current_text = f"{request.title} {request.abstractText}"

    matches = []

    for candidate in request.candidates:
        if candidate.manuscript_id == request.manuscript_id:
            continue

        if candidate.full_text and len(candidate.full_text.strip()) > 50:
            candidate_text = candidate.full_text
        else:
            candidate_text = f"{candidate.title} {candidate.abstractText}"

        similarity = calculate_similarity(current_text, candidate_text)

        if similarity > 0:
            matches.append(
                SimilarityMatch(
                    manuscript_id=candidate.manuscript_id,
                    title=candidate.title,
                    similarity_percentage=similarity,
                )
            )

    matches.sort(key=lambda m: m.similarity_percentage, reverse=True)

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