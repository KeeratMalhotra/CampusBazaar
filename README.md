# NSUT Bazaar

A marketplace just for NSUT students: buy, sell and find help under anonymous usernames, with AI-assisted moderation.

## Project structure

```
CampusBazaar/
├── backend/    FastAPI (Python) API server
└── frontend/   React + TypeScript + Vite + Tailwind web app
```

## Running locally

You need **Python 3.11+** and **Node.js 20+** installed.

### 1. Backend (terminal 1)

```bash
cd backend
python -m venv .venv
# Windows:      .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
fastapi dev app/main.py
```

The API runs at http://localhost:8000. Interactive docs: http://localhost:8000/docs

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev
```

The app runs at http://localhost:5173.
