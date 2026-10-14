from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings

app = FastAPI(title=settings.app_name)

# CORS: browsers block a page on one origin (e.g. localhost:5173) from reading
# responses from another origin (e.g. localhost:8000) unless the server
# explicitly allows it. This middleware adds the headers that allow it.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    app: str


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Simple check that the server is running."""
    return HealthResponse(status="ok", app=settings.app_name)
