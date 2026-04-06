FROM python:3.11-slim

WORKDIR /app

# Copier et installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code
COPY . .

# Exposer le port
EXPOSE 8000

# Démarrer l'application
CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:8000"]
