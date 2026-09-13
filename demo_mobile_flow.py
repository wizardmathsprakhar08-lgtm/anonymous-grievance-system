import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def request_json(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("\n" + "="*60)
print("       JANAWAAZ AI - MOBILE APP END-TO-END DEMO")
print("="*60)

# 1. Citizen Mobile Submission
print("\n[STEP 1] Citizen submits anonymous grievance from Mobile App...")
grievance_payload = {
    "text": "CRITICAL EMERGENCY! Main water pipe burst flooding the entire intersection near school #5! Dirty sewage water is entering houses. Call resident Dr. Rajesh at 9123456780 or email rajesh@gmail.com right now!",
    "category_hint": None
}

res = request_json(f"{BASE_URL}/grievances", method="POST", data=grievance_payload)
tracking_id = res["tracking_id"]

print(f" -> Tracking ID Generated   : {tracking_id}")
print(f" -> Assigned Department     : {res['department_name']} ({res['department_code']})")
print(f" -> Evaluated Urgency       : {res['urgency_level'].upper()} (Score: {res['urgency_score']})")
print(f" -> PII Redacted Text       : {res['sanitized_text']}")
print(f" -> Duplicate Detected?     : {res['is_duplicate']}")

# 2. Citizen Anonymous Status Tracking
print("\n[STEP 2] Citizen tracks grievance status anonymously...")
track_res = request_json(f"{BASE_URL}/grievances/{tracking_id}")
print(f" -> Current Status          : {track_res['status'].upper()}")
print(f" -> Initial Timeline Logs   : {len(track_res['status_logs'])} entry")
for log in track_res['status_logs']:
    print(f"    * [{log['new_status']}] {log['note']}")

# 3. Officer Login
print("\n[STEP 3] Water Department Officer logs into the Mobile Portal...")
login_res = request_json(f"{BASE_URL}/auth/login", method="POST", data={
    "username": "officer_water",
    "password": "officer123"
})
officer_token = login_res["access_token"]
print(f" -> Logged in as            : {login_res['username']} ({login_res['department_name']})")
print(f" -> Role                    : {login_res['role']}")

# 4. Officer views queue
print("\n[STEP 4] Officer inspects department queue sorted by AI Urgency...")
queue_res = request_json(f"{BASE_URL}/officer/queue", token=officer_token)
print(f" -> Items in queue          : {len(queue_res)}")
top_item = queue_res[0]
print(f" -> Top Priority Item ID    : {top_item['tracking_id']} ({top_item['urgency_level'].upper()})")

# 5. Officer Updates Status to In-Progress
print("\n[STEP 5] Officer marks issue IN PROGRESS and adds action note...")
update1 = request_json(
    f"{BASE_URL}/officer/grievances/{res['id']}",
    method="PATCH",
    data={"new_status": "in_progress", "note": "Emergency repair crew dispatched with excavation team."},
    token=officer_token
)
print(f" -> Updated Status          : {update1['status'].upper()}")

# 6. Officer Marks Resolved
time.sleep(1)
print("\n[STEP 6] Officer completes work and marks RESOLVED...")
update2 = request_json(
    f"{BASE_URL}/officer/grievances/{res['id']}",
    method="PATCH",
    data={"new_status": "resolved", "note": "Main pipeline repaired and tested. Water flow restored normal."},
    token=officer_token
)
print(f" -> Updated Status          : {update2['status'].upper()}")

# 7. Citizen Re-checks Timeline
print("\n[STEP 7] Citizen refreshes tracking page to view complete audit trail...")
final_track = request_json(f"{BASE_URL}/grievances/{tracking_id}")
print(f" -> Final Status            : {final_track['status'].upper()}")
print(f" -> Full Timeline Audit Log :")
for log in final_track['status_logs']:
    by = f" by {log['changed_by_username']}" if log['changed_by_username'] else ""
    print(f"    [{log['new_status'].upper()}]{by}: {log['note']}")

# 8. Admin Analytics
print("\n[STEP 8] Administrator reviews live system analytics...")
admin_login = request_json(f"{BASE_URL}/auth/login", method="POST", data={
    "username": "admin",
    "password": "admin123"
})
analytics = request_json(f"{BASE_URL}/admin/analytics", token=admin_login["access_token"])
print(f" -> Total Grievances Filed  : {analytics['total_grievances']}")
print(f" -> Status Breakdown        : {analytics['by_status']}")
print(f" -> Department Breakdown    : {analytics['by_department']}")
print(f" -> Urgency Breakdown       : {analytics['by_urgency']}")
print(f" -> Duplicate Cases         : {analytics['duplicate_count']}")

print("\n" + "="*60)
print("     ALL MOBILE PIPELINE OPERATIONS COMPLETED SUCCESSFULLY!")
print("="*60 + "\n")
