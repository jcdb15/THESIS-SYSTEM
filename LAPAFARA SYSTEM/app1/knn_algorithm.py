import os
import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsRegressor
import joblib
import chardet

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "media", "historical_plant_data.csv")
MODEL_PATH_GROWTH = os.path.join(BASE_DIR, "media", "knn_models", "knn_growth_model.pkl")
MODEL_PATH_HARVEST = os.path.join(BASE_DIR, "media", "knn_models", "knn_harvest_model.pkl")

# Detect file encoding
with open(DATA_PATH, "rb") as f:
    result = chardet.detect(f.read(100000))
    detected_encoding = result["encoding"]

# Load CSV
try:
    df = pd.read_csv(DATA_PATH, encoding=detected_encoding, delimiter=",", on_bad_lines='skip')
except Exception as e:
    print(f"Error loading CSV: {e}")
    exit(1)

# Clean and normalize
df.columns = df.columns.str.strip()
df['Plant Name'] = df['Plant Name'].str.strip().str.title()
df['Soil Type'] = df['Soil Type'].str.strip().str.title()
df['Fertilizer'] = df['Fertilizer'].str.strip().str.title()

# Handle planting and harvest month
df['Planting Month'] = df['Planting Month'].astype(str).str.extract(r'(\d+)').astype(float)
df['Harvest Month'] = df['Harvest Month'].astype(str).str.extract(r'(\d+)').astype(float)

# Convert range in Growth Duration to average
def convert_range_to_avg(val):
    if isinstance(val, str) and '-' in val:
        try:
            start, end = map(int, val.split('-'))
            return (start + end) / 2
        except:
            return np.nan
    try:
        return float(val)
    except:
        return np.nan

df['Growth Duration (Months) Raw'] = df['Growth Duration (Months)']  # Preserve original range
df['Growth Duration (Months)'] = df['Growth Duration (Months)'].apply(convert_range_to_avg)

# Encode soil and fertilizer
soil_mapping = {'Loamy': 0, 'Sandy': 1, 'Clay': 2}
fertilizer_mapping = {'Organic': 0, 'Chemical': 1}
df['Soil Type Encoded'] = df['Soil Type'].map(soil_mapping)
df['Fertilizer Encoded'] = df['Fertilizer'].map(fertilizer_mapping)

# Drop invalid rows
df = df.dropna(subset=['Growth Duration (Months)', 'Harvest Month', 'Soil Type Encoded', 'Fertilizer Encoded'])

# Encode planting month with sin/cos for cyclic representation
df['Month_sin'] = np.sin(2 * np.pi * df['Planting Month'] / 12)
df['Month_cos'] = np.cos(2 * np.pi * df['Planting Month'] / 12)

# One-hot encode plant name
df = pd.get_dummies(df, columns=['Plant Name'], drop_first=True)

# Features and targets
feature_cols = ['Soil Type Encoded', 'Fertilizer Encoded', 'Month_sin', 'Month_cos'] + [col for col in df.columns if col.startswith('Plant Name_')]
X = df[feature_cols].values
y_growth = df['Growth Duration (Months)'].values
y_harvest = df['Harvest Month'].values

# Train models
knn_growth = KNeighborsRegressor(n_neighbors=3, weights='distance')
knn_growth.fit(X, y_growth)

knn_harvest = KNeighborsRegressor(n_neighbors=3, weights='distance')
knn_harvest.fit(X, y_harvest)

# Save models
os.makedirs(os.path.dirname(MODEL_PATH_GROWTH), exist_ok=True)
joblib.dump(knn_growth, MODEL_PATH_GROWTH)
joblib.dump(knn_harvest, MODEL_PATH_HARVEST)
print("Models trained and saved successfully.")

# Load models
def load_models():
    growth_model = joblib.load(MODEL_PATH_GROWTH)
    harvest_model = joblib.load(MODEL_PATH_HARVEST)
    return growth_model, harvest_model

# Prediction API
def predict_growth_api(plant_name, soil, fertilizer, planting_month):
    growth_model, harvest_model = load_models()

    plant_name = plant_name.strip().title()
    soil_code = soil_mapping.get(soil.strip().title(), -1)
    fert_code = fertilizer_mapping.get(fertilizer.strip().title(), -1)

    if soil_code == -1 or fert_code == -1:
        return {"error": "Invalid soil or fertilizer type"}

    try:
        planting_month = int(planting_month)
        if planting_month < 1 or planting_month > 12:
            raise ValueError
    except ValueError:
        return {"error": "Invalid planting month. Must be an integer from 1 to 12."}

    month_sin = np.sin(2 * np.pi * planting_month / 12)
    month_cos = np.cos(2 * np.pi * planting_month / 12)

    plant_name_cols = [col for col in df.columns if col.startswith('Plant Name_')]
    plant_vector = [1 if col == f'Plant Name_{plant_name}' else 0 for col in plant_name_cols]

    if sum(plant_vector) == 0:
        return {"error": f"Invalid plant name '{plant_name}'"}

    input_data = np.array([[soil_code, fert_code, month_sin, month_cos] + plant_vector])
    predicted_growth = round(growth_model.predict(input_data)[0], 1)
    predicted_harvest = round(harvest_model.predict(input_data)[0] % 12 or 12, 1)

    # Try to find exact match in historical data to return original range (e.g., "3-5")
    matched = df[
        (df['Soil Type Encoded'] == soil_code) &
        (df['Fertilizer Encoded'] == fert_code) &
        (df['Month_sin'].round(3) == round(month_sin, 3)) &
        (df[plant_name_cols].eq(plant_vector).all(axis=1))
    ]

    original_growth_range = str(predicted_growth)
    if not matched.empty:
        raw_value = matched['Growth Duration (Months) Raw'].iloc[0]
        if isinstance(raw_value, str) and '-' in raw_value:
            original_growth_range = raw_value

    return {
        "growth_duration": original_growth_range,
        "harvest_month": predicted_harvest
    }

# Optional test
if __name__ == "__main__":
    test = predict_growth_api("Rice", "Loamy", "Organic", 7)
    print("Test Prediction:", test)
