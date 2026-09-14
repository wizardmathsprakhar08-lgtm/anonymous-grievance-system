import urllib.request
import json
import time
import sys

def deploy(api_key):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # 1. Get Owner ID
    print("[1/3] Fetching Render Account Owner ID...")
    req_owners = urllib.request.Request("https://api.render.com/v1/owners", headers=headers)
    with urllib.request.urlopen(req_owners) as resp:
        owners = json.loads(resp.read().decode())
    
    if not owners:
        print("Error: No Render account found for this API key.")
        return
    
    owner_id = owners[0]["owner"]["id"]
    owner_name = owners[0]["owner"].get("name", "User")
    print(f" -> Found Render Account: {owner_name} (ID: {owner_id})")

    # 2. Create Web Service
    print("\n[2/3] Creating and Deploying FastAPI Backend Service...")
    payload = {
        "type": "web_service",
        "name": "janawaaz-ai-backend",
        "ownerId": owner_id,
        "repo": "https://github.com/wizardmathsprakhar08-lgtm/anonymous-grievance-system",
        "branch": "main",
        "autoDeploy": "yes",
        "serviceDetails": {
            "env": "python",
            "plan": "free",
            "region": "oregon",
            "rootDir": "backend",
            "buildCommand": "pip install -r requirements.txt",
            "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
            "envVars": [
                {"key": "PYTHON_VERSION", "value": "3.11.9"}
            ]
        }
    }

    data = json.dumps(payload).encode()
    req_create = urllib.request.Request("https://api.render.com/v1/services", data=data, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req_create) as resp:
            service_data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode()
        print(f"Service creation response: {err_msg}")
        return

    service = service_data.get("service", service_data)
    service_id = service["id"]
    service_url = service.get("serviceDetails", {}).get("url", f"https://{service.get('slug', 'janawaaz-ai-backend')}.onrender.com")

    print(f" -> Web Service Created! Service ID: {service_id}")
    print(f" -> Live URL will be: {service_url}")

    # 3. Monitor Deployment
    print("\n[3/3] Deploying on Render Cloud (this takes 2-3 minutes)...")
    for attempt in range(25):
        time.sleep(10)
        req_status = urllib.request.Request(f"https://api.render.com/v1/services/{service_id}/deploys?limit=1", headers=headers)
        with urllib.request.urlopen(req_status) as resp:
            deploys = json.loads(resp.read().decode())
        
        if deploys and len(deploys) > 0:
            status = deploys[0]["deploy"]["status"]
            print(f" -> Deploy Status ({attempt * 10}s): {status.upper()}")
            if status == "live":
                print(f"\n=======================================================")
                print(f"🎉 DEPLOYMENT LIVE! Backend API is running at:")
                print(f"   {service_url}/api")
                print(f"=======================================================\n")
                return
            elif status in ["build_failed", "canceled", "deactivated"]:
                print(f"Deployment finished with status: {status}")
                return

    print(f"\nDeployment is still building in the background. Your URL is: {service_url}/api")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        deploy(sys.argv[1].strip())
    else:
        key = input("Enter your Render API Key: ").strip()
        if key:
            deploy(key)
        else:
            print("No API key provided.")
