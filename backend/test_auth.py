import requests
import json

url = "https://gestion-stock-k0on.onrender.com/api/auth/register"

data = {
    "nom": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "nom_boutique": "Test Boutique",
    "telephone": "123456789",
    "adresse": "Test Address"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")