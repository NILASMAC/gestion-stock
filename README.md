# Gestion de Stock

Application web de gestion de stock multi-clients.

## Stack
- **Frontend** : React.js + Vite → Vercel
- **Backend**  : Flask (Python) + JWT → Railway / Render
- **Base de données** : PostgreSQL → Railway / Supabase

## Démarrage rapide

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Remplir les variables
flask db upgrade
python run.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env       # Remplir VITE_API_URL
npm run dev
```
