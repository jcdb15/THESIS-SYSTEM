import csv
import os

# Define sample data
data = [
    ["Plant Name", "Soil Type", "Fertilizer", "Planting Month", "Growth Duration (Months)", "Harvest Month"],
    ["Rice", "Loamy", "Organic", "3 (March)", "5", "8 (August)"],
    ["Wheat", "Sandy", "Chemical", "9 (September)", "6", "3 (March)"],
    ["Corn", "Clay", "Organic", "4 (April)", "4", "8 (August)"],
    ["Tomato", "Loamy", "Organic", "2 (February)", "3", "5 (May)"]
]

# Define CSV path
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "data", "historical_data.csv")

# Ensure the 'data' folder exists
os.makedirs(os.path.dirname(csv_path), exist_ok=True)

# Write data to CSV
with open(csv_path, mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerows(data)

print(f"✅ CSV file generated at: {csv_path}")
