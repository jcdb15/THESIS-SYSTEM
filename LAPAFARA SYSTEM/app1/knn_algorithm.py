import pandas as pd
from sklearn.neighbors import KNeighborsRegressor
import numpy as np
import os
import chardet

# Load historical data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "media", "historical_plant_data.csv")

# Detect file encoding
with open(DATA_PATH, "rb") as f:
    result = chardet.detect(f.read(100000))
    detected_encoding = result["encoding"]

# Read CSV
try:
    df = pd.read_csv(DATA_PATH, encoding=detected_encoding, delimiter=",", on_bad_lines='skip')
    print("DataFrame after loading CSV:")
    print(df)
except Exception as e:
    print(f"Error loading CSV: {e}")
    exit(1)

# Ensure required columns exist
required_columns = {'Plant Name', 'Planting Month', 'Harvest Month', 'Soil Type', 'Fertilizer', 'Growth Duration (Months)'}
if not required_columns.issubset(df.columns):
    print(f"Missing columns in CSV: {required_columns - set(df.columns)}")
    exit(1)

# Convert '3 (March)' → 3
df['Planting Month'] = df['Planting Month'].astype(str).str.extract(r'(\d+)').astype(float)
df['Harvest Month'] = df['Harvest Month'].astype(str).str.extract(r'(\d+)').astype(float)

# Convert categorical data to numerical values
soil_mapping = {'Loamy': 0, 'Sandy': 1, 'Clay': 2}
fertilizer_mapping = {'Organic': 0, 'Chemical': 1}

df['Soil Type'] = df['Soil Type'].map(soil_mapping)
df['Fertilizer'] = df['Fertilizer'].map(fertilizer_mapping)

# Handle unmapped values and drop NaNs
df = df.fillna(-1)
df = df[df['Soil Type'] != -1]
df = df[df['Fertilizer'] != -1]

# One-hot encoding for 'Plant Name'
df = pd.get_dummies(df, columns=['Plant Name'], drop_first=True)

# Features and labels
X = df[['Soil Type', 'Fertilizer', 'Planting Month'] + [col for col in df.columns if col.startswith('Plant Name_')]].values
y_growth = df['Growth Duration (Months)'].values
y_harvest = df['Harvest Month'].values

# Train KNN models
knn_growth = KNeighborsRegressor(n_neighbors=3)
knn_growth.fit(X, y_growth)

knn_harvest = KNeighborsRegressor(n_neighbors=3)
knn_harvest.fit(X, y_harvest)

# Prediction function
def predict_growth_api(plant_name, soil, fertilizer, planting_month):
    soil = soil_mapping.get(soil, -1)
    fertilizer = fertilizer_mapping.get(fertilizer, -1)

    if soil == -1 or fertilizer == -1:
        return {"error": "Invalid soil or fertilizer type"}

    try:
        planting_month = int(planting_month)
    except ValueError:
        return {"error": "Invalid planting month. Must be an integer."}

    # One-hot encoding for Plant Name
    plant_name_columns = [f"Plant Name_{plant_name}"]
    if not all(col in df.columns for col in plant_name_columns):
        return {"error": f"Invalid plant name '{plant_name}'"}

    input_data = np.array([[soil, fertilizer, planting_month] + [1 if f"Plant Name_{plant_name}" == col else 0 for col in df.columns if col.startswith('Plant Name_')]])
    print("Input Data for Prediction:", input_data)

    predicted_growth = knn_growth.predict(input_data)[0]
    predicted_harvest = knn_harvest.predict(input_data)[0]

    return {
        "growth_duration": round(predicted_growth, 1),
        "harvest_month": round(predicted_harvest, 1)
    }

# Example prediction for new rice data
result = predict_growth_api(plant_name="Rice", soil="Loamy", fertilizer="Organic", planting_month=6)
print(result)
