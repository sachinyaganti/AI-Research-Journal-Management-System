import unittest
from app.models.similarity_analysis import SimilarityRequest, SimilarityCandidate
from app.services.similarity_analysis_service import calculate_similarity, analyze_similarity, normalize_text
from app.models.ai_content_analysis import AIContentRequest
from app.services.ai_content_service import analyze_ai_content
from app.models.manuscript_analysis import ManuscriptAnalysisRequest
from app.services.llm_analysis_service import analyze_with_llm, get_fallback_analysis


class TestAIServices(unittest.TestCase):

    def test_normalize_text(self):
        words = normalize_text("The deep neural network demonstrates high accuracy on modern benchmarks.")
        self.assertNotIn("the", words)  # stopword filtered
        self.assertIn("neural", words)
        self.assertIn("network", words)
        self.assertIn("accuracy", words)

    def test_calculate_similarity_identical(self):
        text = "Machine learning architectures evaluate automated peer review systems with transformers."
        score = calculate_similarity(text, text)
        self.assertEqual(score, 100.0)

    def test_calculate_similarity_different(self):
        text1 = "Quantum computing algorithms for cryptography and prime factorization."
        text2 = "Agricultural soil microbiome analysis for organic fertilizer efficiency."
        score = calculate_similarity(text1, text2)
        self.assertEqual(score, 0.0)

    def test_analyze_similarity_candidates(self):
        req = SimilarityRequest(
            manuscript_id=1,
            title="AI Peer Review",
            abstractText="This paper proposes an automated review system using transformer models.",
            full_text="This paper proposes an automated review system using transformer models for manuscript quality.",
            candidates=[
                SimilarityCandidate(
                    manuscript_id=2,
                    title="Transformer Peer Review",
                    abstractText="Automated review system evaluating transformer models on manuscripts.",
                    full_text="Automated review system evaluating transformer models on manuscripts."
                )
            ]
        )
        res = analyze_similarity(req)
        self.assertEqual(res.manuscript_id, 1)
        self.assertEqual(len(res.matches), 1)
        self.assertGreater(res.matches[0].similarity_percentage, 0.0)

    def test_ai_content_assessment_probabilistic(self):
        text = ("In conclusion, furthermore, moreover, it is important to note that this highlights the importance "
                "of artificial intelligence in modern computing architectures and data pipelines. " * 10)
        req = AIContentRequest(text=text)
        res = analyze_ai_content(req)
        self.assertTrue(0.0 <= res.ai_content_indicator <= 100.0)
        self.assertTrue(0.0 <= res.human_writing_indicator <= 100.0)
        self.assertTrue(len(res.explanation) > 0)

    def test_fallback_manuscript_analysis(self):
        req = ManuscriptAnalysisRequest(
            title="Graph Neural Networks in Drug Discovery",
            category="Computer Science",
            keywords="graph neural networks, drug discovery, chemistry",
            abstractText="We propose a novel graph neural network architecture to predict molecular properties. Our method evaluates affinity on three benchmarks and achieves superior performance."
        )
        res = get_fallback_analysis(req, "test")
        self.assertIn("abstract_quality", res)
        self.assertIn(res["methodology_quality"], ["PRESENT", "WEAK"])
        self.assertIn(res["results_quality"], ["PRESENT", "WEAK"])
        self.assertIsInstance(res["suggestions"], list)


if __name__ == "__main__":
    unittest.main()
