import os
import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import chardet
from datetime import datetime

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "media", "historical_plant_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH_YIELD = os.path.join(MODEL_DIR, "knn_yield_model.pkl")

# Detect file encoding
with open(DATA_PATH, "rb") as f:
    result = chardet.detect(f.read(100000))
    detected_encoding = result["encoding"]

# Load CSV
df = pd.read_csv(DATA_PATH, encoding=detected_encoding, delimiter=',', on_bad_lines='skip')
df.columns = df.columns.str.strip()

# Preprocessing and handling NaN values
df['Variety'] = df['Variety'].astype(str).str.strip().str.title()
df['Sector Area(ha.)'] = pd.to_numeric(df['Sector Area(ha.)'], errors='coerce')
df['Planted Area(ha.)'] = pd.to_numeric(df['Planted Area(ha.)'], errors='coerce')
df['Average Yield'] = pd.to_numeric(df['Average Yield'], errors='coerce')
df['Date Planted'] = pd.to_datetime(df['Date Planted'], errors='coerce')

# Drop rows with missing essential data
df = df.dropna(subset=['Date Planted', 'Average Yield', 'Variety', 'Production Cost'])

# Feature Engineering
df['Month Planted'] = df['Date Planted'].dt.month
df['Month_sin'] = np.sin(2 * np.pi * df['Month Planted'] / 12)
df['Month_cos'] = np.cos(2 * np.pi * df['Month Planted'] / 12)

# One-hot encode 'Variety'
df = pd.get_dummies(df, columns=['Variety'], drop_first=True)

# Features and target
feature_cols = ['Sector Area(ha.)', 'Planted Area(ha.)', 'Month_sin', 'Month_cos'] + [col for col in df.columns if col.startswith('Variety_')]
df = df.dropna(subset=feature_cols)

X = df[feature_cols].values
y = df['Average Yield'].values

# Scaling the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train-test split for evaluation
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Hyperparameter tuning using GridSearchCV
param_grid = {
    'n_neighbors': [3, 5, 7, 9],
    'weights': ['uniform', 'distance'],
    'metric': ['euclidean', 'manhattan']
}
knn = KNeighborsRegressor()
grid_search = GridSearchCV(knn, param_grid, cv=5, scoring='neg_mean_squared_error')
grid_search.fit(X_train, y_train)

# Get best parameters
best_params = grid_search.best_params_
print(f"Best Hyperparameters: {best_params}")

# Train the model using the best parameters
knn_best = grid_search.best_estimator_

# Save the trained model
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(knn_best, MODEL_PATH_YIELD)
print("Yield prediction model trained and saved.")

# Prediction function
def predict_yield(variety, sector_area, planted_area, date_planted):
    # Load the trained model
    knn_model = joblib.load(MODEL_PATH_YIELD)

    try:
        # Convert inputs to appropriate formats
        sector_area = float(sector_area)
        planted_area = float(planted_area)
        month = pd.to_datetime(date_planted).month
    except Exception as e:
        return {"error": f"Invalid input data. Error: {str(e)}"}

    # Encode month as sine and cosine
    month_sin = np.sin(2 * np.pi * month / 12)
    month_cos = np.cos(2 * np.pi * month / 12)

    # Ensure variety exists in the training data
    variety = variety.strip().title()
    variety_cols = [col for col in df.columns if col.startswith('Variety_')]
    variety_vector = [1 if col == f'Variety_{variety}' else 0 for col in variety_cols]

    if sum(variety_vector) == 0:
        return {"error": f"Variety '{variety}' not found in training data."}

    # Prepare the input vector for prediction
    input_vector = np.array([[sector_area, planted_area, month_sin, month_cos] + variety_vector])
    
    # Scale the input vector
    input_vector_scaled = scaler.transform(input_vector)

    # Predict yield
    predicted_yield = round(knn_model.predict(input_vector_scaled)[0], 2)
    return {"predicted_yield": predicted_yield}

# Optional test
if __name__ == "__main__":
    result = predict_yield("Rc222", 2.0, 1.5, "2024-07-15")
    print("Prediction Result:", result)

# Evaluate the model
y_pred = knn_best.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Squared Error: {mse}")
print(f"R² Score: {r2}")
