from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router
api_router = APIRouter()
# Mount API router with /api prefix
app.include_router(api_router, prefix="/api")

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

# Serve static files
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="static")

# Catch all routes and serve index.html
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404)
    return FileResponse(os.path.join(frontend_path, "index.html"))