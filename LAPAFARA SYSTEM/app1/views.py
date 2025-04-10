from django.shortcuts import render,HttpResponse,redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.shortcuts import render, redirect
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.views import PasswordResetView
from django.core.mail import send_mail
from django.urls import reverse_lazy
from django.http import JsonResponse
from .models import Event
from .knn_algorithm import predict_growth_api
import csv
from django.views.decorators.csrf import csrf_exempt
import os
from .models import Plant
import json
from .forms import PlantForm
from sklearn.neighbors import KNeighborsRegressor
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'app1', 'media', 'historical_plant_data.csv')  # Updated path

# Function to load historical data
def load_historical_data():
    historical_data = []

    try:
        with open(DATA_PATH, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                plant_name = row["Plant Name"]
                entry = {
                    "plant_name": plant_name,
                    "soil_type": row["Soil Type"],
                    "fertilizer": row["Fertilizer"],
                    "planting_month": int(row["Planting Month"]),
                    "growth_duration": int(row["Growth Duration (Months)"]),
                    "harvest_month": int(row["Harvest Month"]),
                }
                historical_data.append(entry)
    except FileNotFoundError:
        print("Error: Historical data file not found.")
        return []
    except Exception as e:
        print(f"Error reading historical data: {str(e)}")
        return []

    return historical_data

# Prediction logic for growth and harvest
@csrf_exempt
def predict_growth_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        # Access form data
        plant_name = request.POST.get("plantSelect")
        soil_type = request.POST.get("soil_type")
        fertilizer = request.POST.get("fertilizer")
        planting_date = request.POST.get("plantingDate")

        if not plant_name or not soil_type or not fertilizer or not planting_date:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Load historical data
        historical_data = load_historical_data()

        if not historical_data:
            return JsonResponse({"error": "No historical data available"}, status=404)

        # Filter historical data by plant name
        plant_data = [entry for entry in historical_data if entry["plant_name"] == plant_name]

        if not plant_data:
            return JsonResponse({"error": "Plant not found in historical data"}, status=404)

        # Filter plant data by soil type and fertilizer
        plant_info = None
        for entry in plant_data:
            if entry["soil_type"] == soil_type and entry["fertilizer"] == fertilizer:
                plant_info = entry
                break
        
        if not plant_info:
            return JsonResponse({"error": "No matching soil type or fertilizer found for this plant"}, status=404)

        # Features for prediction: soil, fertilizer, planting month
        soil_mapping = {'Loamy': 0, 'Sandy': 1, 'Clay': 2}
        fertilizer_mapping = {'Organic': 0, 'Chemical': 1}

        soil = soil_mapping.get(soil_type, -1)
        fertilizer = fertilizer_mapping.get(fertilizer, -1)

        if soil == -1 or fertilizer == -1:
            return JsonResponse({"error": "Invalid soil or fertilizer type"}, status=400)

        # Prepare features for the model (one-hot encoded plant name + other features)
        feature_vector = [soil, fertilizer, plant_info["planting_month"]]

        # One-hot encoding for plant name (if there are multiple varieties of rice)
        plant_names = ['Rice', 'Tomato', 'Other']  # Update with the actual plant names in your dataset
        plant_name_features = [1 if plant_name == plant else 0 for plant in plant_names]

        # Combine features
        feature_vector.extend(plant_name_features)

        # Prepare KNN model (this should already be trained from your earlier code)
        knn_growth = KNeighborsRegressor(n_neighbors=3)
        knn_harvest = KNeighborsRegressor(n_neighbors=3)

        # Training data (you need to train the model using historical data before this part)
        # For simplicity, we will use dummy data here for model fitting
        X = np.array([feature_vector])  # Add appropriate data here for training
        y_growth = np.array([plant_info["growth_duration"]])
        y_harvest = np.array([plant_info["harvest_month"]])

        knn_growth.fit(X, y_growth)
        knn_harvest.fit(X, y_harvest)

        # Predict growth and harvest month
        predicted_growth = knn_growth.predict([feature_vector])[0]
        predicted_harvest = knn_harvest.predict([feature_vector])[0]

        # Prepare growth data for chart (e.g., monthly growth percentage)
        growth_data = [0] * 12
        start_month = plant_info["planting_month"]
        duration = plant_info["growth_duration"]
        for i in range(duration):
            growth_data[(start_month - 1 + i) % 12] = (i + 1) * 20  # Example growth percentage

        # Prepare the response data
        response_data = {
            "growth_duration": round(predicted_growth, 1),
            "harvest_month": round(predicted_harvest, 1),
            "growth_data": growth_data
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

# API to get historical plant data
def get_historical_data(request):
    try:
        historical_data = load_historical_data()
        return JsonResponse(historical_data, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# Home page view (Requires user to be logged in)
@login_required(login_url='login')
def home_page(request):
    return render (request,'home.html')


# Sign up page view
def sign_up_page(request):
    if request.method == 'POST':
        uname = request.POST.get('username')
        email = request.POST.get('email')
        pass1 = request.POST.get('password')
        pass2 = request.POST.get('confirmPassword')

        if pass1 != pass2:
            messages.error(request, "Your password and confirm password do not match!")
            return redirect('signup')

        if User.objects.filter(username=uname).exists():
            messages.error(request, "Username already taken!")
            return redirect('signup')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered!")
            return redirect('signup')

        my_user = User.objects.create_user(uname, email, pass1)
        my_user.save()
        return redirect('login')

    return render(request, 'signup.html')


# Login page view
def login_page(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')  # Ensure 'home' is a URL name, not 'home.html'
        else:
            messages.error(request, "Username or Password is incorrect!")  # Correct way to use messages

    return render(request, 'login.html')

def logout_page(request):
    logout(request)
    messages.success(request, "Logged out successfully")
    return redirect('login')


def member_view(request):
        return render(request, 'member.html')

def plants_view(request):
        return render(request, 'plants.html')


def calendar_view(request):
        return render(request, 'calendar.html')

def memberlist_view(request):
        return render(request, 'memberlist.html')


def about_view(request):
        return render(request, 'about.html')


def plantdatabase_view(request):
    plants = Plant.objects.all()  # Fetch all plants from the database
    form = PlantForm()

    if request.method == 'POST':
        form = PlantForm(request.POST, request.FILES)
        if form.is_valid():
            plant = form.save()  # Save the new plant
            return JsonResponse({
                'name': plant.name,
                'type': plant.plant_type,
                'care': plant.care_instructions,
                'description': plant.description,
                'location': plant.location,
                'quantity': plant.quantity,
                'photoURL': plant.photo.url if plant.photo else ''
            })

    return render(request, 'plantdatabase.html', {'plants': plants, 'form': form})

CSV_FILE_PATH = "C:/jcdb5/Final thesis system/LAPAFARA SYSTEM/app1/media/historical_plant_data.csv"

def get_plant_types():
    plant_types = []
    try:
        with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            plant_types = sorted(set(row["Plant Name"] for row in reader))  # Get unique plant names
    except Exception as e:
        plant_types = []  # Return empty list in case of error

    return plant_types

def plantgrowth_view(request):
    if request.method == 'GET':
        # Ensure you are using the correct path to your CSV file
        csv_path = os.path.join('your', 'csv', 'path.csv')  # Adjust path here
        
        try:
            with open(csv_path, newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                
                # Extract unique plant names from the CSV
                plant_names = list(set(row['Plant'] for row in reader))
                
                # Reset the file pointer after reading the plant names
                csvfile.seek(0)
                
                # Render the template with plant names
                return render(request, 'plantgrowth.html', {'plant_names': plant_names})
        
        except FileNotFoundError:
            # Return an error message if the file is not found
            return render(request, 'plantgrowth.html', {'plant_names': [], 'error': 'CSV file not found'})
        
        except Exception as e:
            # Handle any other errors
            return render(request, 'plantgrowth.html', {'plant_names': [], 'error': f'Error reading CSV: {str(e)}'})

    # Return a fallback response in case of non-GET requests
    return render(request, 'plantgrowth.html', {'plant_names': []})


def profile_view(request):
        return render(request, 'profile.html')



#FORGOT PASSWORD VIEWS START 
def Password_email_view(request):
        return render(request, 'Password_email.html')

def Password_reset_confirm_view(request):
        return render(request, 'Password_reset_confirm.html')

def Password_reset_done_view(request):
        return render(request, 'Password_reset_done.html')

def Password_reset_form_view(request):
        return render(request, 'Password_reset_form.html')

def Password_reset_view(request):
        return render(request, 'Password_reset_complete.html')

def Password_reset_email_view(request):
        return render(request, 'Password_reset_email.html')

class CustomPasswordResetView(PasswordResetView):
    email_template_name = 'Forgotpassword/Password_reset_email.html'
    success_url = reverse_lazy('password_reset_done')
#FORGOT PASSWORD VIEWS END


def check_new_user(request):
    user_count = User.objects.count()
    return JsonResponse({'user_count': user_count})

def user_list(request):
    users = User.objects.all()
    return render(request, 'partials/user_list.html', {'users': users})

#try