# 🌾 Crop Recommendation System — Fullstack FastAPI & ML Backend

An intelligent, production-ready Fullstack application and REST API that predicts the optimal crop to cultivate based on soil and climatic conditions using a **Random Forest Classifier** trained to **99.32% accuracy**.

---

## 🚀 Project Overview

- **ML Model**: Scikit-Learn `RandomForestClassifier` (300 estimators, `max_features='sqrt'`).
- **Features (7)**: Nitrogen ($N$), Phosphorus ($P$), Potassium ($K$), Temperature (°C), Humidity (%), Soil pH, Rainfall (mm).
- **Crops (22 classes)**: Rice, Maize, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee.
- **Backend**: FastAPI with asynchronous endpoints, CORS support, Pydantic validation, and Vercel serverless integration.
- **Frontend**: Responsive UI with sliders, drone aerial visual chapters, presets, Hindi translations, and real-time inference.
- **Deployment**: Zero-configuration Vercel serverless deployment (`vercel.json` & `api/index.py`).

---

## 📁 Directory Structure

```text
frontend/
├── api/
│   ├── __init__.py
│   └── index.py            # FastAPI serverless entrypoint for Vercel & local
├── model/
│   ├── crop_rf_model.pkl   # Trained Random Forest classifier
│   ├── label_encoder.pkl   # 22-class LabelEncoder
│   └── feature_ranges.json # Agricultural training bounds & checks
├── index.html              # Frontend user interface
├── app.js                  # Frontend client logic (auto-detects local vs Vercel)
├── style.css               # Styling & palette design
├── main.py                 # Local standalone runner (FastAPI + static UI)
├── requirements.txt        # Python production dependencies
├── vercel.json             # Vercel deployment routing & runtime config
├── .vercelignore           # Ignored files for lightweight Vercel builds
└── README.md               # Documentation
```

---

## 💻 Local Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the FastAPI Server
```bash
python main.py
```
*(Or alternatively: `uvicorn main:app --reload --host 127.0.0.1 --port 8000`)*

### 3. Open in Browser
- **Interactive Web App**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc Docs**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## ☁️ Deploying to Vercel

This repository is pre-configured for Vercel using `vercel.json` and `@vercel/python`.

### Option A: Deploy via GitHub (Recommended)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete crop recommendation frontend and fastapi backend"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** > **"Project"**.
4. Import your GitHub repository.
5. Keep default settings (Vercel automatically detects `vercel.json` and Python functions).
6. Click **Deploy**. Your app will be live globally!

### Option B: Deploy via Vercel CLI
1. Open PowerShell / Terminal in this folder:
   ```bash
   cd c:\Users\pandi\OneDrive\Desktop\frontend
   ```
2. Log in to Vercel:
   ```bash
   npx vercel login
   ```
3. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## 📡 API Endpoints

### 1. Predict Crop
- **Method**: `POST`
- **Path**: `/predict` (or `/api/predict`)
- **Request Body**:
```json
{
  "N": 90.0,
  "P": 42.0,
  "K": 43.0,
  "temperature": 20.88,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.94
}
```
- **Response**:
```json
{
  "crop": "rice",
  "prediction": "rice",
  "recommended_crop": "rice",
  "confidence": 95.0,
  "confidence_percent": 95.0,
  "confidence_level": "HIGH",
  "status": "OK",
  "recommendations": [
    {
      "crop": "rice",
      "name": "rice",
      "confidence": 95.0,
      "probability": 95.0,
      "probability_percent": 95.0
    },
    {
      "crop": "jute",
      "name": "jute",
      "confidence": 5.0,
      "probability": 5.0,
      "probability_percent": 5.0
    }
  ],
  "warnings": [],
  "out_of_range": [],
  "input_status": "WITHIN TRAINING RANGE"
}
```

### 2. Health Check
- **Method**: `GET`
- **Path**: `/health`
- **Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes_count": 22,
  "classes": ["apple", "banana", "blackgram", "..."]
}
```

### 3. Feature Training Ranges
- **Method**: `GET`
- **Path**: `/feature-ranges`
- Returns minimum and maximum training data bounds for each agricultural indicator.

### 4. Sample Presets
- **Method**: `GET`
- **Path**: `/presets`
- Returns calibrated preset values for quick testing.
