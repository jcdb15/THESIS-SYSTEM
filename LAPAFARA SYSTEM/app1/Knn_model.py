import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import KNeighborsClassifier
import joblib  # To save and load the model

# Load dataset
df = pd.read_csv("plant_data.csv")  # Replace with your actual dataset

# Encode categorical variables
le_plant = LabelEncoder()
le_soil = LabelEncoder()
df["Plant Type"] = le_plant.fit_transform(df["Plant Type"])
df["Soil Type"] = le_soil.fit_transform(df["Soil Type"])

# Define features and target
X = df[["Plant Type", "Temperature", "Soil Type"]]  # Input features
y = df["Best Planting Month"]  # Target variable

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train KNN model
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)

# Save model
joblib.dump(knn, "knn_model.pkl")
joblib.dump(le_plant, "plant_encoder.pkl")
joblib.dump(le_soil, "soil_encoder.pkl")
