from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SimilarityAgent:
    """Agent responsible for detecting duplicate or clustered grievances using TF-IDF + Cosine Similarity."""

    SIMILARITY_THRESHOLD = 0.55

    def run(self, current_text: str, existing_grievances: List[Dict[str, Any]]) -> dict:
        if not existing_grievances:
            return {
                "is_duplicate": False,
                "duplicate_of_id": None,
                "similarity_score": 0.0
            }

        # Extract texts and IDs of existing grievances
        texts = [g["sanitized_text"] for g in existing_grievances]
        ids = [g["id"] for g in existing_grievances]

        # Combine existing texts with current text
        corpus = texts + [current_text]

        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(corpus)
            
            # Cosine similarity between current_text (last index) and all existing
            current_vector = tfidf_matrix[-1]
            existing_vectors = tfidf_matrix[:-1]

            similarities = cosine_similarity(current_vector, existing_vectors)[0]

            max_score = 0.0
            best_match_id: Optional[int] = None

            for idx, score in enumerate(similarities):
                if score > max_score:
                    max_score = float(score)
                    best_match_id = ids[idx]

            max_score = round(max_score, 2)

            if max_score >= self.SIMILARITY_THRESHOLD:
                return {
                    "is_duplicate": True,
                    "duplicate_of_id": best_match_id,
                    "similarity_score": max_score
                }
        except Exception as e:
            print(f"[SimilarityAgent] Exception during vectorization: {e}")

        return {
            "is_duplicate": False,
            "duplicate_of_id": None,
            "similarity_score": 0.0
        }
