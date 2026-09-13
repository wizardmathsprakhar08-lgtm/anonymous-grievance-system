from typing import List, Dict, Any, Optional
from app.agents.intake import IntakeAgent
from app.agents.classification import ClassificationAgent
from app.agents.urgency import UrgencyAgent
from app.agents.similarity import SimilarityAgent
from app.agents.routing import RoutingAgent

class GrievancePipeline:
    """Orchestrator pipeline that executes all 5 AI agents sequentially."""

    def __init__(self):
        self.intake_agent = IntakeAgent()
        self.classification_agent = ClassificationAgent()
        self.urgency_agent = UrgencyAgent()
        self.similarity_agent = SimilarityAgent()
        self.routing_agent = RoutingAgent()

    def run(
        self,
        raw_text: str,
        category_hint: Optional[str],
        existing_grievances: List[Dict[str, Any]],
        departments: List[Dict[str, Any]]
    ) -> dict:
        # Step 1: Intake & Anonymization
        intake_res = self.intake_agent.run(raw_text)

        # Step 2: Classification
        class_res = self.classification_agent.run(intake_res["sanitized_text"], category_hint)

        # Step 3: Urgency Assessment
        urgency_res = self.urgency_agent.run(intake_res["sanitized_text"])

        # Step 4: Similarity & Duplicate Detection
        sim_res = self.similarity_agent.run(intake_res["sanitized_text"], existing_grievances)

        # Step 5: Routing & Queue Assignment
        route_res = self.routing_agent.run(class_res["predicted_code"], departments)

        return {
            "tracking_id": intake_res["tracking_id"],
            "raw_text": raw_text,
            "sanitized_text": intake_res["sanitized_text"],
            "department_id": route_res["department_id"],
            "department_name": route_res["department_name"],
            "department_code": route_res["department_code"],
            "urgency_level": urgency_res["urgency_level"],
            "urgency_score": urgency_res["urgency_score"],
            "is_duplicate": sim_res["is_duplicate"],
            "duplicate_of_id": sim_res["duplicate_of_id"],
            "similarity_score": sim_res["similarity_score"],
            "confidence": class_res["confidence"]
        }
