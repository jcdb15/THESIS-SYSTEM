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
from .forms import PlantForm, MemberForm
from sklearn.neighbors import KNeighborsRegressor
import numpy as np
from datetime import datetime
from .models import Event
import joblib
from .models import Plant
from django.shortcuts import get_object_or_404, redirect
from rest_framework import viewsets
from .models import Member
from .serializers import MemberSerializer
from django.shortcuts import render, redirect
from .forms import MemberForm
from django.shortcuts import render, get_object_or_404
from .models import Member
import os
import csv
from django.conf import settings
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import json
import logging




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
                    "Season_Type": row["Season Type"],
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

# Update the paths to reflect your actual model location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH_GROWTH = os.path.join(BASE_DIR, 'media',"knn_models", 'knn_growth_model.pkl')
MODEL_PATH_HARVEST = os.path.join(BASE_DIR, 'media',"knn_models", 'knn_harvest_model.pkl')

# Mapping for soil and fertilizer
season_mapping = {'Dry': 0, 'Wet': 1}
soil_mapping = {'Loamy': 0, 'Sandy': 1, 'Clay': 2}
fertilizer_mapping = {'Organic': 0, 'Chemical': 1}



# Helper function to load the models
def load_models():
    knn_growth = joblib.load(MODEL_PATH_GROWTH)
    knn_harvest = joblib.load(MODEL_PATH_HARVEST)
    return knn_growth, knn_harvest

@csrf_exempt
def predict_growth_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        # Load trained models
        knn_growth, knn_harvest = load_models()

        # Access and sanitize form data
        plant_name     = request.POST.get("plantSelect", "").strip().title()
        season_type    = request.POST.get("season_type", "").strip().title()
        soil_type      = request.POST.get("soil_type", "").strip().title()
        fertilizer     = request.POST.get("fertilizer", "").strip().title()
        planting_date  = request.POST.get("plantingDate", "")

        # Validate required fields
        if not all([plant_name, season_type, soil_type, fertilizer, planting_date]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Convert planting date to month
        try:
            planting_month = int(planting_date.split("-")[1])  # Extract month from YYYY-MM-DD
        except Exception as e:
            return JsonResponse({"error": "Invalid planting date format. Use YYYY-MM-DD."}, status=400)

        # Prepare features for the model
        soil = soil_mapping.get(soil_type.strip().title(), -1)
        fert = fertilizer_mapping.get(fertilizer.strip().title(), -1)
        season = season_mapping.get(season_type, -1)

        if soil == -1 or fert == -1 or season == -1:
            return JsonResponse({"error": "Invalid soil, fertilizer, or season type"}, status=400)

        # One-hot encode plant name for the model
        plant_names = ['Rice', 'Tomato', 'Carrot', 'Onion', 'Pitchay', 'Watermelon']
        plant_name_features = [1 if plant_name.strip().title() == plant else 0 for plant in plant_names]

        if sum(plant_name_features) == 0:
            return JsonResponse({"error": f"Plant name '{plant_name}' not found in the dataset"}, status=400)

        # Create feature vector (sin/cos encoding for planting month)
        month_sin = np.sin(2 * np.pi * planting_month / 12)
        month_cos = np.cos(2 * np.pi * planting_month / 12)
        feature_vector = [soil, fert, season, month_sin, month_cos] + plant_name_features

        # Make predictions
        predicted_growth = knn_growth.predict([feature_vector])[0]
        predicted_harvest = knn_harvest.predict([feature_vector])[0]

        # Prepare growth chart data (example for 12 months)
        growth_data = [0] * 12
        duration = round(predicted_growth)
        for i in range(duration):
            growth_data[(planting_month - 1 + i) % 12] = (i + 1) * 20

        # Return the predictions
        response_data = {
            "growth_duration": round(predicted_growth, 1),
            "harvest_month": round(predicted_harvest % 12 or 12, 1),
            "growth_data": growth_data
        }

        return JsonResponse(response_data)

    except FileNotFoundError:
        return JsonResponse({"error": "Model files not found. Please run training script first."}, status=500)
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



def plants_view(request):
        return render(request, 'plants.html')


def calendar_view(request):
        return render(request, 'calendar.html')


# addMember page view start
def add_member(request):
    if request.method == 'POST':
        form = MemberForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('add_member')  # Redirect to same page after saving
    else:
        form = MemberForm()
    
    members = Member.objects.all()
    return render(request, "add_member.html", {'form': form, 'members': members})
# addMember page view end 

def edit_member(request, pk=None):
    return render(request, 'edit.html')

def member_view(request):
    if request.method == 'POST':
        form = MemberForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('member_view')  # redirect back to same view name
    else:
        form = MemberForm()

    members = Member.objects.all()
    return render(request, 'member.html', {'form': form, 'members': members})

def memberlist_view(request):
        return render(request, 'memberlist.html')
class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer



def calendar_view(request):
    return render(request, 'calendar.html')

# API Endpoints para sa Events

# I-update ang get_events function para isama ang title, description, at iba pang detalye
def get_events(request):
    events = Event.objects.all()
    events_data = []
    for event in events:
        events_data.append({
            'id': event.id,
            'day': event.date.day,
            'month': event.date.month - 1,  # Ayusin para maging zero-based index
            'year': event.date.year,
            'title': event.title,  # Siguraduhing kasama ang title
            'description': event.description,  # Siguraduhing kasama ang description
            'time': event.date.strftime('%H:%M'),  # I-format ang oras
        })
    return JsonResponse({'events': events_data})

@csrf_exempt
def add_event(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data.get('title')
        date = data.get('date')
        time = data.get('time')

        try:
            # Pagsamahin ang date at time at i-parse ito bilang isang datetime object
            event_datetime = datetime.strptime(f"{date} {time}", '%Y-%m-%d %H:%M')

            event = Event.objects.create(
                title=title,
                date=event_datetime,
                description=title,  # Puwede mong palitan ito ng custom na description
            )
            event.save()
            return JsonResponse({'message': 'Event naidagdag ng matagumpay'}, status=201)
        except ValueError as e:
            return JsonResponse({'error': f"Invalid na format ng date/time: {str(e)}"}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

# Mag-delete ng event
@csrf_exempt
def delete_event(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        event_id = data.get('eventId')

        try:
            event = Event.objects.get(id=event_id)
            event.delete()
            return JsonResponse({'message': 'Event na-delete ng matagumpay'}, status=200)
        except Event.DoesNotExist:
            return JsonResponse({'error': 'Event hindi natagpuan'}, status=404)

# I-clear ang lahat ng events
def clear_all_events(request):
    if request.method == 'POST':
        Event.objects.all().delete()  # Deletes all events in the database
        return JsonResponse({'message': 'All events cleared successfully!'}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)
# Password Reset View
class CustomPasswordResetView(PasswordResetView):
    email_template_name = 'Forgotpassword/password_reset_email.html'
    success_url = reverse_lazy('password_reset_done')


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
                'location': plant.location,
                'quantity': plant.quantity,
                'photoURL': plant.photo.url if plant.photo else ''
            })

    return render(request, 'plantdatabase.html', {'plants': plants, 'form': form})

CSV_FILE_PATH = "C:/jcdb5/Final thesis system/LAPAFARA SYSTEM/app1/media/historical_plant_data.csv"

def delete_plant(request, plant_id):
    # Fetch the plant object by ID, or return a 404 if not found
    plant = get_object_or_404(Plant, id=plant_id)
    
    # Delete the plant
    plant.delete()
    
    # Redirect to another page (like the plant list page) after deletion
    return redirect('plant_list')  # Replace 'plant_list' with the name of your plant list view


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
    # Get all plant objects from the database
    plants = Plant.objects.all()
    
    # Extract only plant names for the dropdown
    plant_names = [plant.name for plant in plants]

    if request.method == "POST":
        # Get form data (assuming the form includes fields for plant_name, soil, fertilizer, and planting_month)
        plant_name = request.POST.get('plant_name')
        soil = request.POST.get('soil')
        fertilizer = request.POST.get('fertilizer')
        planting_month = request.POST.get('planting_month')

        # Call the KNN prediction function
        result = predict_growth_api(plant_name, soil, fertilizer, planting_month)

        if 'error' in result:
            # Return an error if prediction fails
            return JsonResponse({"error": result["error"]}, status=400)

        # Extract growth duration and harvest month
        growth_duration = result["growth_duration"]
        harvest_month = result["harvest_month"]

        # Render the result along with plant names
        return render(request, 'plantgrowth.html', {
            'plant_names': plant_names,
            'growth_duration': growth_duration,
            'harvest_month': harvest_month,
        })
    
    return render(request, 'plantgrowth.html', {'plant_names': plant_names})


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

def about_view(request):
    return render(request, 'about.html') 


def historical_data_view(request):
    return render(request, 'Historical_data.html')



# Load historical data
def load_historical_data(request):
    csv_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')
    data = []

    try:
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            data = list(reader)
        return JsonResponse({'status': 'success', 'data': data})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

# Add row to CSV
import csv
import os
import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def add_row(request):
    if request.method == 'POST':
        try:
            # Parse JSON data mula sa body ng request
            data = json.loads(request.body)

            # Path ng CSV file
            csv_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')  

            # Check kung ang file ay already existing
            file_exists = os.path.isfile(csv_path)

            # Open ang CSV file in append mode
            with open(csv_path, 'a', newline='', encoding='utf-8') as csvfile:
                # Fieldnames na gagamitin sa CSV
                fieldnames = ['Plant', 'Season Type', 'Year', 'Planting Month', 'Soil Type', 'Fertilizer', 'Growth Duration (months)', 'Harvest Month']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                # If file doesn't exist, write the header
                if not file_exists:
                    writer.writeheader()

                # Write the data row
                writer.writerow({
                    'Plant': data['Plant'],
                    'Season Type': data['Season Type'],
                    'Year': data['Year'],
                    'Planting Month': data['Planting Month'],
                    'Soil Type': data['Soil Type'],
                    'Fertilizer': data['Fertilizer'],
                    'Growth Duration (months)': data['Growth Duration (months)'],
                    'Harvest Month': data['Harvest Month']
                })

            # Return success response
            return JsonResponse({'status': 'success'})

        except Exception as e:
            # Log the error and return error response
            return JsonResponse({'status': 'error', 'message': str(e)})

    # If method is not POST, return Bad Request
    return HttpResponseBadRequest('Invalid request method')

def delete_row(request):
    if request.method == 'POST':
        row_data = json.loads(request.body)
        print("Received data for deletion:", row_data)  # Debugging the data

        # Path to your CSV file
        csv_file_path = 'path_to_your_csv_file.csv'

        # Read the CSV and filter out the row to delete
        rows = []
        with open(csv_file_path, 'r', newline='') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Check if the row matches the data to be deleted
                if not (row['Plant'] == row_data['Plant'] and
                        row['Year'] == row_data['Year'] and
                        row['Planting Month'] == row_data['Planting Month'] and
                        row['Soil Type'] == row_data['Soil Type'] and
                        row['Fertilizer'] == row_data['Fertilizer'] and
                        row['Growth Duration (months)'] == row_data['Growth Duration (months)'] and
                        row['Harvest Month'] == row_data['Harvest Month']):
                    rows.append(row)

        # Write the filtered rows back to the CSV file
        with open(csv_file_path, 'w', newline='') as file:
            fieldnames = ['Plant', 'Year', 'Planting Month', 'Soil Type', 'Fertilizer', 'Growth Duration (months)', 'Harvest Month']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

        # Return success response
        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


# Set up logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@csrf_exempt
def upload_csv(request):
    if request.method == 'POST':
        try:
            # Print the request body to debug
            print(f"Request body: {request.body.decode('utf-8')}")
            
            data = json.loads(request.body)
            csv_content = data.get('csv')

            if csv_content:
                csv_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')

                # Step 1: Split into lines
                lines = csv_content.splitlines()

                # Step 2: Remove any completely empty lines
                cleaned_lines = [line for line in lines if line.strip() != '']

                # Step 3: Join it back properly
                cleaned_csv_content = '\n'.join(cleaned_lines)

                # Log the cleaned CSV content for debugging
                logger.debug(f"Saving cleaned CSV content to {csv_path}: {cleaned_csv_content}")

                # Step 4: Save the cleaned content to the file
                with open(csv_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_csv_content)

                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'error': 'No CSV data received.'})
        except Exception as e:
            logger.error(f"Error uploading CSV: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

def add_member_view(request):
    # Your view logic for adding a member
    return render(request, 'add_member_template.html')

def harvest_calendar_view(request):
    # Your logic here
   return render(request, 'harvest_calendar.html')

def plant_harvest_view(request):
    return render(request, 'plantharvest.html')

#trys