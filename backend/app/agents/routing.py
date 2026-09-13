from typing import List, Dict, Any

class RoutingAgent:
    """Agent responsible for assigning grievances to specific department queues."""

    def run(self, predicted_code: str, departments: List[Dict[str, Any]]) -> dict:
        dept_map = {d["code"]: d["id"] for d in departments}
        dept_name_map = {d["code"]: d["name"] for d in departments}

        # Resolve department ID
        if predicted_code in dept_map:
            assigned_id = dept_map[predicted_code]
            assigned_name = dept_name_map[predicted_code]
            code = predicted_code
        else:
            # Fallback to first department
            assigned_id = departments[0]["id"]
            assigned_name = departments[0]["name"]
            code = departments[0]["code"]

        return {
            "department_id": assigned_id,
            "department_name": assigned_name,
            "department_code": code
        }
