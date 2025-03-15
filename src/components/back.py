import requests

url = "http://127.0.0.1:5000/chat"
headers = {"Content-Type": "application/json"}
data = {"prompt": "Hello?"}

response = requests.post(url, headers=headers, json=data)
print(response.json())
