"""Quick script to test ADK FastAPI endpoints."""
import requests
import json
from uuid import uuid4

BASE_URL = "http://localhost:8000"
session_id = str(uuid4())
user_id = "u_test123"

# Payload for /run endpoint
run_payload = {
    "appName": "app",
    "userId": user_id,
    "sessionId": session_id,
    "newMessage": {
        "parts": [{"text": "Hello, can you help me with meal planning?"}],
        "role": "user"
    }
}

print(f"Testing with session_id: {session_id}\n")

# First check if server is running
try:
    response = requests.get(BASE_URL, timeout=2)
    print(f"Server is running: {response.status_code}\n")
except Exception as e:
    print(f"Server not reachable: {e}\n")
    exit(1)

# Step 1: Create session
session_url = f"{BASE_URL}/apps/app/users/{user_id}/sessions/{session_id}"
print(f"Step 1: Creating session at {session_url}")
try:
    response = requests.post(session_url, json={}, timeout=10)
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        print(f"  Session created successfully")
    else:
        print(f"  Error: {response.text}")
        exit(1)
except Exception as e:
    print(f"  Error: {e}")
    exit(1)

print()

# Step 2: Test /run endpoint
print(f"Step 2: Running agent at {BASE_URL}/run")
try:
    response = requests.post(f"{BASE_URL}/run", json=run_payload, timeout=60)
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  Events returned: {len(data)}")
        for event in data:
            if event.get('content', {}).get('parts'):
                for part in event['content']['parts']:
                    if part.get('text'):
                        print(f"\n  Agent response:\n  {part['text'][:500]}")
    else:
        print(f"  Error: {response.text}")
except Exception as e:
    print(f"  Error: {e}")
