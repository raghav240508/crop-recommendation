import os
import sys
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from api.index import app

# Mount static files (HTML, JS, CSS, drone images) so local server serves the full frontend
if (BASE_DIR / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(BASE_DIR), html=True), name="frontend_app")

if __name__ == "__main__":
    import uvicorn
    print("\n🌱 Starting Crop Recommendation ML Server...")
    print("📍 Local Web App:      http://127.0.0.1:8000")
    print("📍 API Docs (Swagger): http://127.0.0.1:8000/docs")
    print("📍 Predict Endpoint:   http://127.0.0.1:8000/predict\n")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
