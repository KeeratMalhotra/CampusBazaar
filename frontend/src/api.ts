// Where the backend lives. Vite exposes env variables that start with VITE_
// through import.meta.env. The value comes from frontend/.env (see .env.example).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// The shape of the JSON our backend's /api/health endpoint returns.
// It mirrors the HealthResponse Pydantic model in backend/app/main.py.
export type HealthResponse = {
  status: string
  app: string
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/api/health`)
  if (!response.ok) {
    throw new Error(`Backend responded with status ${response.status}`)
  }
  return response.json()
}
