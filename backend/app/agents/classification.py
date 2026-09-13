from typing import Optional, Dict

class ClassificationAgent:
    """Agent responsible for categorizing grievances into municipal departments using keyword matching."""

    KEYWORDS: Dict[str, list] = {
        "water": ["water", "pipe", "leak", "drain", "sewage", "drinking", "tap", "pipeline", "overflowing water", "contamination", "no water"],
        "road": ["road", "pothole", "traffic", "street", "bridge", "signal", "asphalt", "highway", "footpath", "accident blackspot", "street light"],
        "electricity": ["electricity", "power", "outage", "transformer", "wire", "blackout", "sparking", "voltage", "electric pole", "current"],
        "sanitation": ["garbage", "trash", "sanitation", "waste", "cleanliness", "dump", "smell", "dustbin", "litter", "filth", "hygiene"],
        "corruption": ["bribe", "corruption", "fraud", "officer", "money", "extortion", "illegal fee", "scam", "kickback", "misconduct"]
    }

    def run(self, sanitized_text: str, category_hint: Optional[str] = None) -> dict:
        text_lower = sanitized_text.lower()
        scores = {code: 0 for code in self.KEYWORDS}

        # Keyword frequency scoring
        for code, keywords in self.KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    scores[code] += 1

        # Boost score if category hint matches
        if category_hint and category_hint in scores:
            scores[category_hint] += 3

        best_code = max(scores, key=scores.get)
        highest_score = scores[best_code]

        # Default fallback to 'road' or 'sanitation' if no keywords found
        if highest_score == 0:
            best_code = category_hint if (category_hint and category_hint in self.KEYWORDS) else "road"
            confidence = 0.50
        else:
            confidence = min(0.95, 0.60 + (highest_score * 0.10))

        return {
            "predicted_code": best_code,
            "confidence": round(confidence, 2)
        }
