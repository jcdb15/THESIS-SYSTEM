# knn_algorithm.py
import os
import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsRegressor
import joblib
import chardet

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "media", "historical_plant_data.csv")
MODEL_PATH_GROWTH = os.path.join(BASE_DIR, "media","knn_models", "knn_growth_model.pkl")
MODEL_PATH_HARVEST = os.path.join(BASE_DIR, "media","knn_models", "knn_harvest_model.pkl")

# Load CSV with encoding detection
with open(DATA_PATH, "rb") as f:
    result = chardet.detect(f.read(100000))
    detected_encoding = result["encoding"]

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

df['Planting Month'] = df['Planting Month'].astype(str).str.extract(r'(\d+)').astype(float)
df['Harvest Month'] = df['Harvest Month'].astype(str).str.extract(r'(\d+)').astype(float)

soil_mapping = {'Loamy': 0, 'Sandy': 1, 'Clay': 2}
fertilizer_mapping = {'Organic': 0, 'Chemical': 1}
df['Soil Type'] = df['Soil Type'].map(soil_mapping)
df['Fertilizer'] = df['Fertilizer'].map(fertilizer_mapping)

df = df.fillna(-1)
df = df[(df['Soil Type'] != -1) & (df['Fertilizer'] != -1)]

df['Month_sin'] = np.sin(2 * np.pi * df['Planting Month'] / 12)
df['Month_cos'] = np.cos(2 * np.pi * df['Planting Month'] / 12)

df = pd.get_dummies(df, columns=['Plant Name'], drop_first=True)

feature_cols = ['Soil Type', 'Fertilizer', 'Month_sin', 'Month_cos'] + [col for col in df.columns if col.startswith('Plant Name_')]
X = df[feature_cols].values
y_growth = df['Growth Duration (Months)'].values
y_harvest = df['Harvest Month'].values

# Train models
knn_growth = KNeighborsRegressor(n_neighbors=3, weights='distance')
knn_growth.fit(X, y_growth)

knn_harvest = KNeighborsRegressor(n_neighbors=3, weights='distance')
knn_harvest.fit(X, y_harvest)

# Save models
joblib.dump(knn_growth, MODEL_PATH_GROWTH)
joblib.dump(knn_harvest, MODEL_PATH_HARVEST)
print("Models trained and saved successfully.")

# Load models for use in prediction
def load_models():
    growth_model = joblib.load(MODEL_PATH_GROWTH)
    harvest_model = joblib.load(MODEL_PATH_HARVEST)
    return growth_model, harvest_model

# Prediction function
def predict_growth_api(plant_name, soil, fertilizer, planting_month):
    growth_model, harvest_model = load_models()

    plant_name = plant_name.strip().title()
    soil = soil_mapping.get(soil.strip().title(), -1)
    fertilizer = fertilizer_mapping.get(fertilizer.strip().title(), -1)

    if soil == -1 or fertilizer == -1:
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

    input_data = np.array([[soil, fertilizer, month_sin, month_cos] + plant_vector])
    predicted_growth = growth_model.predict(input_data)[0]
    predicted_harvest = harvest_model.predict(input_data)[0]

    return {
        "growth_duration": round(predicted_growth, 1),
        "harvest_month": round(predicted_harvest % 12 or 12, 1)
    }

# Optional test
if __name__ == "__main__":
    test = predict_growth_api("Rice", "Loamy", "Organic", 6)
    print("Test Prediction:", test)
