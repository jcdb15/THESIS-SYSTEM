import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import KNeighborsRegressor
import numpy as np

class KNNPredictor:
    def __init__(self, data_file):
        # Load dataset
        self.df = pd.read_csv(data_file)

        # Encode categorical variables
        self.label_encoders = {}
        for column in ["plant_name", "soil_type", "fertilizer"]:
            le = LabelEncoder()
            self.df[column] = le.fit_transform(self.df[column])
            self.label_encoders[column] = le

        # Define feature columns and target variables
        self.features = ["planting_month", "soil_type", "fertilizer", "avg_temperature", "rainfall"]
        self.target_growth = "growth_duration"
        self.target_harvest = "harvest_month"

        # Train KNN model
        self.knn_growth = KNeighborsRegressor(n_neighbors=3)
        self.knn_growth.fit(self.df[self.features], self.df[self.target_growth])

        self.knn_harvest = KNeighborsRegressor(n_neighbors=3)
        self.knn_harvest.fit(self.df[self.features], self.df[self.target_harvest])

    def predict(self, planting_month, soil_type, fertilizer):
        # Convert categorical inputs
        soil_encoded = self.label_encoders["soil_type"].transform([soil_type])[0]
        fertilizer_encoded = self.label_encoders["fertilizer"].transform([fertilizer])[0]

        # Get average temp and rainfall for the planting month (from historical data)
        avg_temp = np.mean(self.df[self.df["planting_month"] == planting_month]["avg_temperature"])
        avg_rainfall = np.mean(self.df[self.df["planting_month"] == planting_month]["rainfall"])

        if np.isnan(avg_temp) or np.isnan(avg_rainfall):
            avg_temp, avg_rainfall = 20, 200  # Default values if no historical data found

        # Prepare input data
        input_data = [[planting_month, soil_encoded, fertilizer_encoded, avg_temp, avg_rainfall]]

        # Predict growth duration and harvest month
        predicted_growth = self.knn_growth.predict(input_data)[0]
        predicted_harvest = self.knn_harvest.predict(input_data)[0]

        return round(predicted_growth, 2), round(predicted_harvest)