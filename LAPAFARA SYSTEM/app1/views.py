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
import csv
import os
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import LabelEncoder
from django.http import JsonResponse
from .knn_algorithm import predict_yield
from django.http import JsonResponse
import pandas as pd
import os
from django.views.decorators.csrf import csrf_exempt
import csv
from collections import defaultdict
from django.http import JsonResponse
from datetime import datetime
from sklearn.preprocessing import StandardScaler
import random
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView



BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'app1', 'media', 'historical_plant_data.csv')

def load_historical_data():
    historical_data = []

    try:
        with open(DATA_PATH, "r", encoding="utf-8-sig") as file:
            reader = csv.DictReader(file)
            for row in reader:
                entry = {
                    "farmer_name": row["Name of Farmer"],
                    "lot_no": row["Lot No."],
                    "sector_no": row["Sector No."],
                    "sector_area": float(row["Sector Area(ha.)"]),
                    "planted_area": float(row["Planted Area(ha.)"]),
                    "date_planted": row["Date Planted"],
                    "variety": row["Variety"],
                    "average_yield": float(row["Average Yield"]),
                    "production_cost": float(row["Production Cost"]),
                    "price_per_kilo": float(row["Price/Kilo"]),
                }
                historical_data.append(entry)
    except FileNotFoundError:
        print("Error: Historical data file not found.")
        return []
    except Exception as e:
        print(f"Error reading historical data: {str(e)}")
        return []

    return historical_data

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
        # Handle form submission via AJAX
        first_name = request.POST.get('first_name')
        middle_name = request.POST.get('middle_name')
        last_name = request.POST.get('last_name')
        gender = request.POST.get('gender')
        birth_date = request.POST.get('birth_date')
        address = request.POST.get('address')
        email = request.POST.get('email')
        contact_number = request.POST.get('contact_number')
        employment_date = request.POST.get('employment_date')
        photo = request.FILES.get('photo')  # Handling the uploaded photo

        # Create a new member
        member = Member(
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            gender=gender,
            birth_date=birth_date,
            address=address,
            email=email,
            contact_number=contact_number,
            employment_date=employment_date,
            photo=photo,
        )
        member.save()

        return JsonResponse({'success': True, 'message': 'Member added successfully!'})
    return JsonResponse({'success': False, 'message': 'Failed to add member'})
# addMember page view end

class MemberListView(APIView):
    def get(self, request):
        members = Member.objects.all()
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data) 

@api_view(['POST'])
def add_member(request):
    if request.method == 'POST':
        serializer = MemberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Member added successfully'}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'message': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)


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
    csv_path = os.path.join(settings.MEDIA_ROOT, 'app1', 'media', 'historical_plant_data.csv')
    plant_data = []

    if os.path.exists(csv_path):
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                plant_data.append(row)

    return render(request, 'plantgrowth.html', {'plant_data': plant_data})


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
            # Parse JSON data from the request body
            data = json.loads(request.body)

            # Path to the CSV file (ensure it's inside MEDIA_ROOT)
            csv_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')  

            # Check if the file exists
            file_exists = os.path.isfile(csv_path)

            # Open the CSV file in append mode
            with open(csv_path, 'a', newline='', encoding='utf-8') as csvfile:
                # Define the fieldnames to match the CSV structure
                fieldnames = ['Name of Farmer', 'Lot No.', 'Sector No.', 'Sector Area(ha.)', 
                              'Planted Area(ha.)', 'Date Planted', 'Variety', 'Average Yield', 
                              'Production Cost', 'Price/Kilo']
                
                # Create a CSV writer object
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                # If the file doesn't exist, write the header row
                if not file_exists:
                    writer.writeheader()

                # Map frontend camelCase keys to CSV column names
                writer.writerow({
                    'Name of Farmer': str(data.get('Name of Farmer', '')),
                    'Lot No.': str(data.get('Lot No.', '')),
                    'Sector No.': str(data.get('Sector No.', '')),
                    'Sector Area(ha.)': str(data.get('Sector Area(ha.)', '')),
                    'Planted Area(ha.)': str(data.get('Planted Area(ha.)', '')),
                    'Date Planted': str(data.get('Date Planted', '')),
                    'Variety': str(data.get('Variety', '')),
                    'Average Yield': str(data.get('Average Yield', '')),
                    'Production Cost': str(data.get('Production Cost', '')),
                    'Price/Kilo': str(data.get('Price/Kilo', ''))
                })

            # Return a success response
            return JsonResponse({'status': 'success'})

        except Exception as e:
            # If any error occurs, return an error response
            return JsonResponse({'status': 'error', 'message': str(e)})

    # If the method is not POST, return a bad request response
    return HttpResponseBadRequest('Invalid request method')

@csrf_exempt
def delete_row(request):
    if request.method == 'POST':
        row_data = json.loads(request.body)
        print("Received data for deletion:", row_data)

        csv_file_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')

        if not os.path.exists(csv_file_path):
            return JsonResponse({'status': 'error', 'message': 'CSV file not found.'}, status=404)

        remaining_rows = []
        deleted = False
        with open(csv_file_path, 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row['Name of Farmer'] == row_data["Name of Farmer"] and row['Lot No.'] == row_data["Lot No."]:
                    deleted = True
                    continue
                remaining_rows.append(row)

        if deleted:
            with open(csv_file_path, 'w', newline='', encoding='utf-8') as file:
                fieldnames = ['Name of Farmer', 'Lot No.', 'Sector No.', 'Sector Area(ha.)',
                              'Planted Area(ha.)', 'Date Planted', 'Variety', 'Average Yield',
                              'Production Cost', 'Price/Kilo']
                writer = csv.DictWriter(file, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(remaining_rows)
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'not_found', 'message': 'Entry not found.'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=400)

# Set up logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)





@csrf_exempt
def upload_csv(request):
    if request.method == 'POST':
        # Check if a file was uploaded
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({'status': 'error', 'message': 'No file uploaded.'}, status=400)

        try:
            # Path to the target CSV file
            csv_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')

            # Read the uploaded CSV
            uploaded_data = uploaded_file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(uploaded_data)

            # Define the expected fieldnames
            expected_fields = ['Name of Farmer', 'Lot No.', 'Sector No.', 'Sector Area(ha.)',
                               'Planted Area(ha.)', 'Date Planted', 'Variety', 'Average Yield',
                               'Production Cost', 'Price/Kilo']

            if reader.fieldnames != expected_fields:
                return JsonResponse({'status': 'error', 'message': 'CSV header does not match expected format.'}, status=400)

            # Append uploaded rows to the existing CSV
            file_exists = os.path.isfile(csv_path)
            with open(csv_path, 'a', newline='', encoding='utf-8') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=expected_fields)
                if not file_exists:
                    writer.writeheader()
                for row in reader:
                    writer.writerow(row)

            return JsonResponse({'status': 'success', 'message': 'CSV uploaded and data appended.'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return HttpResponseBadRequest('Invalid request method.')

def add_member_view(request):
    # Your view logic for adding a member
 return render(request, 'memberlist.html')



def harvest_calendar_view(request):
    # Your logic here
   return render(request, 'harvest_calendar.html')

#trys

@csrf_exempt
def get_predicted_yield(variety, planted_area):
    file_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        return None  # Could not read file

    # Filter the dataframe for the given variety
    df_filtered = df[df['Variety'].str.strip().str.lower() == variety.strip().lower()]

    if df_filtered.empty:
        return None  # No matching data

    # Calculate the average yield and predicted yield
    try:
        df_filtered['Average Yield'] = df_filtered['Average Yield'].apply(lambda x: float(x.replace('cavans', '').strip()))
        df_filtered['Planted Area(ha.)'] = df_filtered['Planted Area(ha.)'].astype(float)

        total_yield_per_ha = (df_filtered['Average Yield'] / df_filtered['Planted Area(ha.)']).sum()
        count = len(df_filtered)

        if count == 0:
            return None

        average_yield_per_ha = total_yield_per_ha / count
        predicted_yield = average_yield_per_ha * planted_area

        return predicted_yield
    except Exception as e:
        return None  # Handle any errors in calculation


@csrf_exempt
def predict_yield_api(request):
    if request.method == "POST":
        variety = request.POST.get('variety')
        planted_area = request.POST.get('planted_area')

        if not variety or not planted_area:
            return JsonResponse({'error': 'Missing input data.'}, status=400)

        try:
            planted_area = float(planted_area)
        except ValueError:
            return JsonResponse({'error': 'Invalid planted area.'}, status=400)

        # Define yield range for different varieties (in cavan per hectare)
        yield_ranges = {
            'TH82': (99, 105),  # Yield range for TH82
            '216': (99, 103),   # Yield range for 216
            '222': (99, 101),   # Yield range for 222
        }

        # Check if the variety exists in the yield ranges
        if variety not in yield_ranges:
            return JsonResponse({'error': 'Unknown rice variety.'}, status=400)

        # Get the yield range for the selected variety
        min_yield, max_yield = yield_ranges[variety]

        # Calculate a random yield within the range for the selected variety
        yield_per_hectare = random.uniform(min_yield, max_yield)

        # Calculate predicted yield in cavans
        predicted_yield = planted_area * yield_per_hectare

        return JsonResponse({
            'variety': variety,
            'yield_per_hectare': round(yield_per_hectare, 2),
            'predicted_yield': round(predicted_yield, 2),
        })

    return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
def get_variety_history(request):
    variety = request.GET.get('variety')
    if not variety:
        return JsonResponse({'status': 'error', 'message': 'No variety provided'})

    csv_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')
    history = []

    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['Variety'].strip() == variety.strip():
                    try:
                        # Normalize the date format for display
                        date_str = row['Date Planted'].replace('-', '/')
                        date = datetime.strptime(date_str, '%m/%d/%Y')
                    except ValueError:
                        try:
                            date = datetime.strptime(date_str, '%Y-%m-%d')
                        except ValueError:
                            # Log the invalid date or skip row
                            continue

                    history.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'yield_per_hectare': float(row['Average Yield']),
                    })

        # Sort by date (ensure it's sorted chronologically)
        history.sort(key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))

        return JsonResponse({'status': 'success', 'history': history})
    except FileNotFoundError:
        return JsonResponse({'status': 'error', 'message': 'CSV file not found'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})


@csrf_exempt
def get_variety_data(request):
    variety = request.GET.get('variety', '')
    data = []

    # Correct path to your CSV file
    csv_path = os.path.join(settings.BASE_DIR, 'app1', 'media', 'historical_plant_data.csv')

    try:
        with open(csv_path, newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row['Variety'].strip() == variety:
                    try:
                        year = datetime.strptime(row['Date Planted'], '%m/%d/%Y').year
                    except ValueError:
                        year = datetime.strptime(row['Date Planted'], '%Y-%m-%d').year
                    data.append({
                        'year': year,
                        'yield': float(row['Average Yield']),
                    })
        
        return JsonResponse({'data': data})
    except FileNotFoundError:
        return JsonResponse({'status': 'error', 'message': 'CSV file not found'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
    
@csrf_exempt
def get_csv_data(request):
    csv_path = os.path.join(settings.MEDIA_ROOT, 'historical_plant_data.csv')
    data = []
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append({
                "farmerName": row.get("Name of Farmer", ""),
                "lotNo": row.get("Lot No.", ""),
                "sectorNo": row.get("Sector No.", ""),
                "serviceArea": row.get("Sector Area(ha.)", ""),
                "plantedArea": row.get("Planted Area(ha.)", ""),
                "datePlanted": row.get("Date Planted", ""),
                "variety": row.get("Variety", ""),
                "avgYield": row.get("Average Yield", ""),
                "productionCost": row.get("Production Cost", ""),
                "pricePerKilo": row.get("Price/Kilo", "")
            })
    return JsonResponse(data, safe=False)



    
