import re

class UrgencyAgent:
    """Agent responsible for analyzing severity, sentiment, and urgency using heuristics."""

    CRITICAL_KEYWORDS = ["fire", "hazard", "unsafe", "danger", "injury", "collapse", "death", "emergency", "fatal", "gas leak", "poisonous", "sparking wire", "electrocution"]
    HIGH_KEYWORDS = ["accident", "broken", "burst", "overflow", "blackout", "extortion", "threat", "severe", "blocked road", "contaminated water", "urgent"]
    MEDIUM_KEYWORDS = ["leak", "dirty", "pothole", "delay", "smell", "issue", "bribe", "complaint", "dark", "garbage"]

    def run(self, sanitized_text: str) -> dict:
        text = sanitized_text
        text_lower = text.lower()
        score = 0.20  # Base urgency

        # 1. Keyword analysis
        for kw in self.CRITICAL_KEYWORDS:
            if kw in text_lower:
                score += 0.40

        for kw in self.HIGH_KEYWORDS:
            if kw in text_lower:
                score += 0.25

        for kw in self.MEDIUM_KEYWORDS:
            if kw in text_lower:
                score += 0.10

        # 2. Exclamation marks heuristic
        exclamation_count = text.count("!")
        if exclamation_count > 0:
            score += min(0.15, exclamation_count * 0.05)

        # 3. Uppercase ratio heuristic (shouting/panic)
        words = text.split()
        if words:
            upper_words = [w for w in words if w.isupper() and len(w) > 2]
            upper_ratio = len(upper_words) / len(words)
            if upper_ratio > 0.2:
                score += 0.15

        # 4. Text length heuristic (detailed complaints often indicate seriousness)
        if len(text) > 250:
            score += 0.05

        # Cap score between 0.10 and 1.00
        score = round(min(1.00, max(0.10, score)), 2)

        # Categorize level
        if score >= 0.75:
            level = "critical"
        elif score >= 0.50:
            level = "high"
        elif score >= 0.30:
            level = "medium"
        else:
            level = "low"

        return {
            "urgency_score": score,
            "urgency_level": level
        }
