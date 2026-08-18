import requests

API = "http://localhost:8000/api/auth/signup"

payload = {"email": "tester@example.com", "password": "password123", "display_name": "Tester"}
resp = requests.post(API, json=payload, timeout=10)
print(resp.status_code, resp.text)
