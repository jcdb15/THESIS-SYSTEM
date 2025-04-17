import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.externals import joblib

# Load data
data = pd.read_csv('historical_plant_data.csv')

# Features (input) and Targets (output)
features = data[['Plant Name', 'Soil Type', 'Fertilizer', 'Planting Month']]
growth_duration = data['Growth Duration (Months)']
harvest_month = data['Harvest Month']

# One-hot encoding for categorical data (Soil Type, Fertilizer, Plant Name)
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(), ['Plant Name', 'Soil Type', 'Fertilizer'])
    ])

# Create KNN models for Growth Duration and Harvest Month
knn_growth = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('knn', KNeighborsRegressor(n_neighbors=3))
])

knn_harvest = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('knn', KNeighborsRegressor(n_neighbors=3))
])

# Train the models
knn_growth.fit(features, growth_duration)
knn_harvest.fit(features, harvest_month)

# Save the models to files
joblib.dump(knn_growth, 'knn_growth_model.pkl')
joblib.dump(knn_harvest, 'knn_harvest_model.pkl')

print("Models trained and saved successfully.")
