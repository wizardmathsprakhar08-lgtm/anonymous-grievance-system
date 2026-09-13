import re
import hashlib
import time
import random

class IntakeAgent:
    """Agent responsible for anonymizing sensitive user data (PII) and generating a unique tracking ID."""
    
    def __init__(self):
        # Regex patterns for anonymization
        self.email_pattern = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
        self.phone_pattern = re.compile(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
        self.name_patterns = [
            re.compile(r'\b(my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b', re.IGNORECASE),
            re.compile(r'\b(Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+)\b', re.IGNORECASE)
        ]

    def run(self, raw_text: str) -> dict:
        sanitized = raw_text
        
        # 1. Strip Email addresses
        sanitized = self.email_pattern.sub("[EMAIL REDACTED]", sanitized)
        
        # 2. Strip Phone numbers
        sanitized = self.phone_pattern.sub("[PHONE REDACTED]", sanitized)
        
        # 3. Strip self-identified names
        for pattern in self.name_patterns:
            sanitized = pattern.sub(r'\1 [NAME REDACTED]', sanitized)
            
        # 4. Generate SHA-256 tracking ID
        seed = f"{raw_text}_{time.time()}_{random.randint(1000, 9999)}"
        tracking_id = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:16].upper()
        # Format tracking ID as AGY-XXXX-XXXX for user-friendly display
        formatted_tracking_id = f"AGY-{tracking_id[:4]}-{tracking_id[4:8]}-{tracking_id[8:12]}"

        return {
            "sanitized_text": sanitized,
            "tracking_id": formatted_tracking_id
        }
