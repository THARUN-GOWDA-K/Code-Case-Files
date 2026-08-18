"""Simple script to exercise the submission endpoint for stage 1.
Assumes backend running at http://localhost:8000 and Judge0 reachable via JUDGE0_URL env.
"""
import requests

API = "http://localhost:8000/api/submissions"

# A Python solution that reads a list literal and prints the sum
source = '''import ast
s = input().strip()
arr = ast.literal_eval(s)
print(sum(arr))
'''

payload = {"stage_id": 1, "language": "python", "source": source, "final": True}

resp = requests.post(API, json=payload, timeout=30)
print("Status:", resp.status_code)
print(resp.json())
