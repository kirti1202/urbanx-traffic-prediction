import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

print("=" * 50)
print("  UrbanX AI — Traffic Model Trainer")
print("=" * 50)

# ══════════════════════════════════════════════
#  STEP 1: Load ONLY Traffic.csv
#  (tf.csv has values 1-30 which are too small
#   and drown out the real traffic patterns)
# ══════════════════════════════════════════════
df = pd.read_csv("Traffic.csv")
print(f"\n✅ Loaded Traffic.csv — {len(df)} rows")
print(f"   Columns: {list(df.columns)}")

# ══════════════════════════════════════════════
#  STEP 2: Parse time from the Time column
#  Format: "12:00:00 AM" / "1:30:00 PM"
# ══════════════════════════════════════════════
def parse_hour(t):
    try:
        return pd.to_datetime(t, format="%I:%M:%S %p").hour
    except:
        try:
            return pd.to_datetime(t).hour
        except:
            return 9  # default

df["hour"]  = df["Time"].apply(parse_hour)
df["day"]   = pd.to_numeric(df["Date"], errors="coerce").fillna(15).astype(int)
df["month"] = 6  # dataset doesn't have month — set to 6 (June) as default

# ══════════════════════════════════════════════
#  STEP 3: Add useful engineered features
# ══════════════════════════════════════════════

# Rush hour flag (8-10 AM and 5-8 PM)
df["is_rush"] = df["hour"].apply(
    lambda h: 1 if (8 <= h <= 10) or (17 <= h <= 20) else 0
)

# Night hour flag (10 PM - 6 AM)
df["is_night"] = df["hour"].apply(
    lambda h: 1 if h >= 22 or h <= 5 else 0
)

# Day of week as number (Monday=0)
day_map = {
    "Monday":0, "Tuesday":1, "Wednesday":2,
    "Thursday":3, "Friday":4, "Saturday":5, "Sunday":6
}
df["day_of_week"] = df["Day of the week"].map(day_map).fillna(0).astype(int)

# Weekend flag
df["is_weekend"] = df["day_of_week"].apply(lambda d: 1 if d >= 5 else 0)

# Hour sine/cosine (captures cyclical nature of time)
df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)

print(f"\n✅ Features engineered")
print(f"   Hour range:  {df['hour'].min()} – {df['hour'].max()}")
print(f"   Total range: {df['Total'].min()} – {df['Total'].max()}")
print(f"   Total mean:  {df['Total'].mean():.1f}")

# ══════════════════════════════════════════════
#  STEP 4: Features & target
# ══════════════════════════════════════════════
FEATURES = [
    "hour", "day", "month",
    "is_rush", "is_night",
    "day_of_week", "is_weekend",
    "hour_sin", "hour_cos"
]

X = df[FEATURES]
y = df["Total"]

print(f"\n✅ Training features: {FEATURES}")
print(f"   Dataset size: {len(X)} rows")

# ══════════════════════════════════════════════
#  STEP 5: Train / test split
# ══════════════════════════════════════════════
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ══════════════════════════════════════════════
#  STEP 6: Train GradientBoostingRegressor
#  (much better than RandomForest for this size)
# ══════════════════════════════════════════════
print("\n⏳ Training GradientBoostingRegressor...")

model = GradientBoostingRegressor(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.1,
    min_samples_split=5,
    random_state=42
)
model.fit(X_train, y_train)

# ══════════════════════════════════════════════
#  STEP 7: Evaluate
# ══════════════════════════════════════════════
y_pred = model.predict(X_test)
mae    = mean_absolute_error(y_test, y_pred)
r2     = r2_score(y_test, y_pred)

print(f"\n📊 Model Performance:")
print(f"   MAE (avg error):  {mae:.1f} vehicles")
print(f"   R² score:         {r2:.3f}  (1.0 = perfect)")

# ══════════════════════════════════════════════
#  STEP 8: Quick sanity check
# ══════════════════════════════════════════════
print("\n🔍 Sanity Check — sample predictions:")
test_cases = [
    {"hour":9,  "day":15, "month":6, "is_rush":1, "is_night":0, "day_of_week":1, "is_weekend":0, "hour_sin":0.97, "hour_cos":-0.26},
    {"hour":14, "day":15, "month":6, "is_rush":0, "is_night":0, "day_of_week":1, "is_weekend":0, "hour_sin":0.71, "hour_cos":-0.71},
    {"hour":18, "day":15, "month":6, "is_rush":1, "is_night":0, "day_of_week":1, "is_weekend":0, "hour_sin":-0.71, "hour_cos":-0.71},
    {"hour":2,  "day":15, "month":6, "is_rush":0, "is_night":1, "day_of_week":1, "is_weekend":0, "hour_sin":-0.5,  "hour_cos":0.87},
    {"hour":9,  "day":15, "month":6, "is_rush":1, "is_night":0, "day_of_week":6, "is_weekend":1, "hour_sin":0.97, "hour_cos":-0.26},
]
labels = ["9 AM weekday (rush)", "2 PM weekday", "6 PM weekday (rush)", "2 AM night", "9 AM weekend"]
for case, label in zip(test_cases, labels):
    pred = int(model.predict(pd.DataFrame([case]))[0])
    print(f"   {label:25s} → {pred} vehicles")

# ══════════════════════════════════════════════
#  STEP 9: Save model
# ══════════════════════════════════════════════
joblib.dump(model, "traffic_model.pkl")
print(f"\n✅ Model saved → traffic_model.pkl")
print("   Run: python app.py  to start Flask")
print("=" * 50)