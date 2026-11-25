import os
import json
import warnings
from pathlib import Path
from typing import List, Dict, Any, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Filter model version warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Paths resolution
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

def resolve_model_path(filename: str) -> Path:
    candidates = [
        BASE_DIR / filename,
        BASE_DIR / "model" / filename,
        PROJECT_ROOT / "model" / filename,
        PROJECT_ROOT / filename,
        Path.cwd() / "model" / filename,
        Path.cwd() / filename,
        Path(r"C:\Users\pandi\Downloads") / filename,
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError(f"Could not locate {filename} in candidate paths: {[str(c) for c in candidates]}")

# Load model, label encoder, and feature ranges lazily with caching
_cached_rf = None
_cached_le = None
_cached_ranges = None

def get_model_bundle():
    global _cached_rf, _cached_le, _cached_ranges
    if _cached_rf is None or _cached_le is None or _cached_ranges is None:
        rf_path = resolve_model_path("crop_rf_model.pkl")
        le_path = resolve_model_path("label_encoder.pkl")
        ranges_path = resolve_model_path("feature_ranges.json")
        
        _cached_rf = joblib.load(rf_path)
        _cached_le = joblib.load(le_path)
        with open(ranges_path, "r", encoding="utf-8") as f:
            _cached_ranges = json.load(f)
            
    return _cached_rf, _cached_le, _cached_ranges

app = FastAPI(
    title="Crop Recommendation ML API",
    description="FastAPI backend serving a Random Forest classifier (99.3% accuracy) for intelligent crop recommendations.",
    version="1.0.0",
)

# CORS configuration: Allow all origins so frontend works seamlessly locally or on Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
CONFIDENCE_THRESHOLD = 0.70

class CropInput(BaseModel):
    N: float = Field(..., description="Nitrogen ratio in soil (0 - 140)")
    P: float = Field(..., description="Phosphorus ratio in soil (5 - 145)")
    K: float = Field(..., description="Potassium ratio in soil (5 - 205)")
    temperature: float = Field(..., description="Temperature in °C (8 - 45)")
    humidity: float = Field(..., description="Relative humidity in % (10 - 100)")
    ph: float = Field(..., description="Soil pH level (3.5 - 10.0)")
    rainfall: float = Field(..., description="Rainfall in mm (20 - 300)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "N": 90.0,
                "P": 42.0,
                "K": 43.0,
                "temperature": 20.88,
                "humidity": 82.0,
                "ph": 6.5,
                "rainfall": 202.94,
            }
        }
    }

class PredictionResponse(BaseModel):
    crop: str
    prediction: str
    recommended_crop: str
    confidence: float
    confidence_percent: float
    confidence_level: str
    status: str
    recommendations: List[Dict[str, Any]]
    predictions: List[Dict[str, Any]]
    top_predictions: List[Dict[str, Any]]
    warnings: List[str]
    out_of_range: List[Dict[str, Any]]
    input_status: str

@app.get("/")
def root():
    index_path = PROJECT_ROOT / "index.html"
    if index_path.exists():
        from fastapi.responses import FileResponse
        return FileResponse(index_path)
    return {
        "message": "Crop Recommendation ML API is running.",
        "model": "Random Forest Classifier (300 estimators)",
        "accuracy": "99.3%",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "feature_ranges": "/feature-ranges",
            "presets": "/presets",
            "docs": "/docs",
        },
    }

@app.get("/api")
def api_info():
    return {
        "message": "Crop Recommendation ML API is running.",
        "model": "Random Forest Classifier (300 estimators)",
        "accuracy": "99.3%",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "feature_ranges": "/feature-ranges",
            "presets": "/presets",
            "docs": "/docs",
        },
    }

@app.get("/health")
def health():
    try:
        rf, le, ranges = get_model_bundle()
        return {
            "status": "healthy",
            "model_loaded": True,
            "classes_count": len(le.classes_),
            "classes": list(le.classes_),
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "model_loaded": False,
            "error": str(e),
        }

@app.get("/feature-ranges")
def feature_ranges():
    _, _, ranges = get_model_bundle()
    return ranges

@app.get("/presets")
def sample_presets():
    return {
        "rice": {"N": 90, "P": 42, "K": 43, "temperature": 20.88, "humidity": 82.00, "ph": 6.50, "rainfall": 202.94},
        "maize": {"N": 78, "P": 48, "K": 20, "temperature": 22.39, "humidity": 65.09, "ph": 6.25, "rainfall": 84.77},
        "chickpea": {"N": 40, "P": 68, "K": 80, "temperature": 18.87, "humidity": 16.86, "ph": 7.34, "rainfall": 80.06},
        "kidneybeans": {"N": 21, "P": 68, "K": 20, "temperature": 20.12, "humidity": 21.61, "ph": 5.75, "rainfall": 105.92},
        "cotton": {"N": 118, "P": 46, "K": 20, "temperature": 23.99, "humidity": 79.84, "ph": 6.91, "rainfall": 80.40},
        "coffee": {"N": 101, "P": 29, "K": 30, "temperature": 25.54, "humidity": 58.87, "ph": 6.79, "rainfall": 158.07},
    }

@app.post("/predict", response_model=PredictionResponse)
@app.post("/api/predict", response_model=PredictionResponse)
def predict(data: CropInput):
    try:
        rf, le, ranges = get_model_bundle()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Model bundle could not be loaded: {str(e)}")

    sample = data.model_dump()
    
    # Check out-of-range values against training ranges
    warnings_list = []
    out_of_range = []
    for f in FEATURES:
        lo = ranges.get(f, {}).get("min", float("-inf"))
        hi = ranges.get(f, {}).get("max", float("inf"))
        val = sample[f]
        if val < lo or val > hi:
            msg = f"{f}={val} is outside the training range ({lo:.1f} to {hi:.1f})"
            warnings_list.append(msg)
            out_of_range.append({
                "feature": f,
                "value": val,
                "range": [lo, hi],
            })

    # Prepare DataFrame with feature names
    input_df = pd.DataFrame([sample])[FEATURES]
    proba = rf.predict_proba(input_df)[0]
    ranked_indices = np.argsort(proba)[::-1]
    
    top_crop_idx = ranked_indices[0]
    top_crop_name = str(le.classes_[top_crop_idx])
    confidence_val = float(proba[top_crop_idx])
    confidence_pct = round(confidence_val * 100, 1)

    # Determine status & confidence level
    if warnings_list:
        status_text = "OUT_OF_RANGE: prediction may be unreliable"
    elif confidence_val < CONFIDENCE_THRESHOLD:
        status_text = "LOW_CONFIDENCE: consider consulting an agricultural expert"
    else:
        status_text = "OK"

    if confidence_pct >= 80:
        conf_level = "HIGH"
    elif confidence_pct >= 55:
        conf_level = "MODERATE"
    else:
        conf_level = "LOW"

    # Top recommendations (up to 3)
    recommendations = []
    top_predictions = []
    for idx in ranked_indices[:3]:
        p = float(proba[idx])
        if p > 0:
            c_name = str(le.classes_[idx])
            p_pct = round(p * 100, 1)
            item = {
                "crop": c_name,
                "name": c_name,
                "confidence": p_pct,
                "probability": p_pct,
                "probability_percent": p_pct,
            }
            recommendations.append(item)
            top_predictions.append(item)

    return {
        "crop": top_crop_name,
        "prediction": top_crop_name,
        "recommended_crop": top_crop_name,
        "confidence": confidence_pct,
        "confidence_percent": confidence_pct,
        "confidence_level": conf_level,
        "status": status_text,
        "recommendations": recommendations,
        "predictions": recommendations,
        "top_predictions": top_predictions,
        "warnings": warnings_list,
        "out_of_range": out_of_range,
        "input_status": "OUT OF TRAINING RANGE" if out_of_range else "WITHIN TRAINING RANGE",
    }
