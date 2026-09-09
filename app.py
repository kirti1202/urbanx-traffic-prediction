from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import requests
import re
import os

app = Flask(__name__)
CORS(app)

model = joblib.load("traffic_model.pkl")

# Hugging Face token .env se aayega
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_URL = "https://api-inference.huggingface.co/models/google/gemma-2b-it"
HF_HDR = {"Authorization": f"Bearer {HF_TOKEN}"}


# ══════════════════════════════════════════════
#  HELPER: build feature row for the model
#  Must match EXACTLY what clean.py trained on
# ══════════════════════════════════════════════
def build_features(hour, day, month, day_of_week=1):
    is_rush = 1 if (8 <= hour <= 10) or (17 <= hour <= 20) else 0
    is_night = 1 if hour >= 22 or hour <= 5 else 0
    is_weekend = 1 if day_of_week >= 5 else 0
    hour_sin = float(np.sin(2 * np.pi * hour / 24))
    hour_cos = float(np.cos(2 * np.pi * hour / 24))

    return pd.DataFrame([{
        "hour": hour,
        "day": day,
        "month": month,
        "is_rush": is_rush,
        "is_night": is_night,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "hour_sin": hour_sin,
        "hour_cos": hour_cos,
    }])


# ══════════════════════════════════════════════
#  HELPER: vehicles → level / color / eta
# ══════════════════════════════════════════════
def classify(vehicles):
    if vehicles < 60:
        return "Low", "#22c55e", 0
    elif vehicles < 120:
        return "Medium", "#f59e0b", 8
    elif vehicles < 180:
        return "High", "#ef4444", 18
    else:
        return "Severe", "#7c3aed", 35


# ══════════════════════════════════════════════
#  HELPER: extract time from natural text
# ══════════════════════════════════════════════
def extract_time(question):
    try:
        prompt = (
            "Extract hour (0-23), day (1-31), month (1-12) from this sentence.\n"
            "Reply ONLY with three comma-separated numbers. Example: 9,15,6\n\n"
            f"Sentence: {question}"
        )

        r = requests.post(
            MODEL_URL,
            headers=HF_HDR,
            json={"inputs": prompt},
            timeout=15
        )

        text = r.json()[0]["generated_text"]

        m = re.search(r"(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})", text)
        if m:
            return int(m.group(1)), int(m.group(2)), int(m.group(3))

    except Exception:
        pass

    # Regex fallback
    hour, day, month = 9, 15, 6

    hm = re.search(r"\b(\d{1,2})\s*(am|pm)?\b", question, re.I)
    if hm:
        h = int(hm.group(1))
        if hm.group(2) and "pm" in hm.group(2).lower() and h != 12:
            h += 12
        hour = min(h, 23)

    dm = re.search(r"\b(\d{1,2})(st|nd|rd|th)?\b", question)
    if dm:
        day = min(int(dm.group(1)), 31)

    months = {
        "jan":1, "feb":2, "mar":3, "apr":4,
        "may":5, "jun":6, "jul":7, "aug":8,
        "sep":9, "oct":10, "nov":11, "dec":12
    }

    for name, num in months.items():
        if name in question.lower():
            month = num
            break

    return hour, day, month


# ══════════════════════════════════════════════
#  GET /
# ══════════════════════════════════════════════
@app.route("/")
def home():
    return jsonify({"status": "UrbanX Flask running ✅"})


# ══════════════════════════════════════════════
#  POST /chat
# ══════════════════════════════════════════════
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data.get("message", "")

    hour, day, month = extract_time(question)

    sample = build_features(hour, day, month)
    vehicles = int(model.predict(sample)[0])

    level, color, eta_add = classify(vehicles)

    return jsonify({
        "prediction": vehicles,
        "level": level,
        "color": color,
        "eta_add": eta_add,
        "hour": hour,
        "day": day,
        "month": month,
        "message": f"Predicted {vehicles} vehicles — {level} traffic. +{eta_add} min delay."
    })


# ══════════════════════════════════════════════
#  POST /predict
# ══════════════════════════════════════════════
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    hour = int(data.get("hour", 9))
    day = int(data.get("day", 15))
    month = int(data.get("month", 6))
    dow = int(data.get("day_of_week", 1))

    sample = build_features(hour, day, month, dow)
    vehicles = int(model.predict(sample)[0])

    level, color, eta_add = classify(vehicles)

    return jsonify({
        "prediction": vehicles,
        "level": level,
        "color": color,
        "eta_add": eta_add,
        "hour": hour,
        "day": day,
        "month": month,
        "message": f"Predicted {vehicles} vehicles — {level} traffic."
    })


# ══════════════════════════════════════════════
#  POST /route_traffic
# ══════════════════════════════════════════════
@app.route("/route_traffic", methods=["POST"])
def route_traffic():
    data = request.get_json()

    fr = data.get("from")
    to = data.get("to")

    hour = int(data.get("hour", 9))
    month = int(data.get("month", 6))

    osrm_url = (
        "http://router.project-osrm.org/route/v1/driving/"
        f"{fr['lng']},{fr['lat']};"
        f"{to['lng']},{to['lat']}"
        "?overview=full&geometries=geojson"
    )

    print(f"[OSRM] {osrm_url}")

    try:
        r = requests.get(osrm_url, timeout=12)
        result = r.json()

        if result.get("code") != "Ok":
            return jsonify({
                "error": "OSRM error: " + result.get("message", "unknown")
            }), 400

        route = result["routes"][0]
        coords = route["geometry"]["coordinates"]
        duration = route["duration"]
        distance = route["distance"]

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    n = len(coords)
    seg = max(1, n // 4)

    segment_params = [
        {"hour": hour, "day": 15, "dow": 1},
        {"hour": hour, "day": 16, "dow": 2},
        {"hour": (hour + 1) % 24, "day": 15, "dow": 3},
        {"hour": (hour + 1) % 24, "day": 16, "dow": 4},
    ]

    segments = []

    for i in range(4):
        s = i * seg
        e = (i + 1) * seg if i < 3 else n

        seg_coords = [[c[1], c[0]] for c in coords[s:e]]

        p = segment_params[i]
        sample = build_features(p["hour"], p["day"], month, p["dow"])
        vehicles = int(model.predict(sample)[0])

        _, color, _ = classify(vehicles)

        segments.append({
            "coords": seg_coords,
            "color": color,
            "vehicles": vehicles
        })

    base_eta = round(duration / 60)
    extra = sum(8 for s in segments if s["vehicles"] >= 120)
    dist_km = round(distance / 1000, 1)

    print(
        f"[ROUTE] dist={dist_km}km eta={base_eta + extra}min vehicles="
        f"{[s['vehicles'] for s in segments]}"
    )

    return jsonify({
        "segments": segments,
        "eta_min": base_eta + extra,
        "dist_km": dist_km,
        "all_coords": [[c[1], c[0]] for c in coords]
    })


if __name__ == "__main__":
    app.run(debug=True, port=5001)