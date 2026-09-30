import re

from app.models.ai_content_analysis import (
    AIContentRequest,
    AIContentResponse,
)


def analyze_ai_content(
    request: AIContentRequest,
) -> AIContentResponse:

    text = request.text.strip()

    words = re.findall(
        r"\b[a-zA-Z]+\b",
        text,
    )

    word_count = len(words)

    if word_count == 0:
        return AIContentResponse(
            ai_content_indicator=0.0,
            human_writing_indicator=0.0,
            confidence="LOW",
            signals=[],
            explanation="Insufficient readable text for assessment.",
        )

    sentences = re.split(
        r"[.!?]+",
        text,
    )

    sentences = [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]

    sentence_lengths = [
        len(
            re.findall(
                r"\b[a-zA-Z]+\b",
                sentence,
            )
        )
        for sentence in sentences
    ]

    average_sentence_length = (
        sum(sentence_lengths) / len(sentence_lengths)
        if sentence_lengths
        else 0
    )

    unique_words = len(set(word.lower() for word in words))

    lexical_diversity = (
        unique_words / word_count
        if word_count
        else 0
    )

    signals = []

    indicator = 0.0

    # Signal 1: unusually uniform sentence lengths
    if sentence_lengths:

        mean = average_sentence_length

        variance = sum(
            (length - mean) ** 2
            for length in sentence_lengths
        ) / len(sentence_lengths)

        sentence_variation = variance ** 0.5

        if (
            sentence_variation < 8
            and len(sentence_lengths) >= 10
        ):
            indicator += 20
            signals.append(
                "Sentence lengths show relatively low variation."
            )

    # Signal 2: high lexical repetition
    if lexical_diversity < 0.35 and word_count > 500:

        indicator += 20

        signals.append(
            "The text contains relatively high lexical repetition."
        )

    # Signal 3: highly repetitive sentence openings
    if len(sentences) >= 10:

        openings = []

        for sentence in sentences:

            sentence_words = re.findall(
                r"\b[a-zA-Z]+\b",
                sentence.lower(),
            )

            if sentence_words:
                openings.append(
                    " ".join(sentence_words[:2])
                )

        if openings:

            repeated_openings = (
                len(openings)
                - len(set(openings))
            )

            repetition_ratio = (
                repeated_openings / len(openings)
            )

            if repetition_ratio > 0.25:

                indicator += 20

                signals.append(
                    "Several sentences use repeated opening patterns."
                )

    # Signal 4: generic AI-like transition phrases
    generic_patterns = [
        r"\bin conclusion\b",
        r"\bfurthermore\b",
        r"\bmoreover\b",
        r"\bit is important to note\b",
        r"\bin addition\b",
        r"\bthis highlights the importance\b",
    ]

    generic_count = sum(
        len(re.findall(pattern, text.lower()))
        for pattern in generic_patterns
    )

    if generic_count >= 5:

        indicator += 20

        signals.append(
            "Frequent generic transition or explanatory phrases were detected."
        )

    # Signal 5: extremely regular sentence length
    if (
        average_sentence_length >= 18
        and average_sentence_length <= 28
        and len(sentence_lengths) >= 20
    ):

        indicator += 20

        signals.append(
            "Sentence lengths fall within a relatively narrow range."
        )

    indicator = min(
        round(indicator, 2),
        100.0,
    )

    human_indicator = round(
        100.0 - indicator,
        2,
    )

    if word_count < 500:

        confidence = "LOW"

    elif word_count < 1500:

        confidence = "MEDIUM"

    else:

        confidence = "HIGH"

    if indicator >= 70:

        explanation = (
            "The text contains several statistical and stylistic "
            "patterns that may be associated with AI-assisted "
            "writing. This is an indicator only and should not be "
            "treated as definitive evidence of AI authorship."
        )

    elif indicator >= 40:

        explanation = (
            "Some patterns associated with AI-assisted writing "
            "were detected, but the evidence is mixed. Human "
            "editing or normal academic writing patterns may "
            "produce similar signals."
        )

    else:

        explanation = (
            "The analyzed text does not show many of the "
            "statistical and stylistic patterns used by this "
            "baseline assessment. This does not prove that the "
            "text was written entirely by a human."
        )

    return AIContentResponse(
        ai_content_indicator=indicator,
        human_writing_indicator=human_indicator,
        confidence=confidence,
        signals=signals,
        explanation=explanation,
    )