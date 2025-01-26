from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from router import product

app = FastAPI()

# Configurazione CORS aggiornata
origins = [
    "http://15.204.245.166:5173",    # Frontend IP
    "http://15.204.245.166:8002",    # Backend IP
    "http://localhost:5173",
    "http://localhost:8002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create API router
app.include_router(product.router)

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

# Serve static files
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="static")

# Catch all routes and serve index.html
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404)
    return FileResponse(os.path.join(frontend_path, "index.html"))