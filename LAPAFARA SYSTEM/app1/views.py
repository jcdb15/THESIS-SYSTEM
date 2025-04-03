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

# Load historical plant data from CSV
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "media", "historical_plant_data.csv")

def load_historical_data():
    historical_data = {}

    with open("historical_plant_data.csv", "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            plant_name = row["Plant Name"]
            entry = {
                "soil_type": row["Soil Type"],
                "fertilizer": row["Fertilizer"],
                "planting_month": int(row["Planting Month"]),
                "growth_duration": int(row["Growth Duration (Months)"]),
                "harvest_month": int(row["Harvest Month"]),
            }
            if plant_name in historical_data:
                historical_data[plant_name].append(entry)
            else:
                historical_data[plant_name] = [entry]

    return historical_data

# API to return predicted plant growth
@csrf_exempt
def predict_growth_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        # Access form data
        plant_name = request.POST.get("plantSelect")
        planting_date = request.POST.get("plantingDate")
        soil_type = request.POST.get("soil_type")
        fertilizer = request.POST.get("fertilizer")

        if not plant_name or not planting_date or not soil_type or not fertilizer:
            return JsonResponse({"error": "Missing required fields"}, status=400)
        
        # Load historical data
        historical_data = load_historical_data()

        if plant_name not in historical_data:
            return JsonResponse({"error": "Plant not found in historical data"}, status=404)

        plant_info = historical_data[plant_name]

        # Validate user input matches historical data
        if soil_type != plant_info["soil_type"] or fertilizer != plant_info["fertilizer"]:
            return JsonResponse({"error": "Soil type or fertilizer does not match historical data"}, status=400)

        # Prepare growth data for chart
        growth_data = [0] * 12
        start_month = plant_info["planting_month"]
        duration = plant_info["growth_duration"]
        for i in range(duration):
            growth_data[(start_month - 1 + i) % 12] = (i + 1) * 20  # Example growth percentage

        response_data = {
            "growth_duration": plant_info["growth_duration"],
            "harvest_month": plant_info["harvest_month"],
            "growth_data": growth_data
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)




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
        messages.success(request, "Account created successfully! Please log in.")
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
        return render(request, 'plantdatabase.html')

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
    plant_types = get_plant_types()  # Fetch plant types from CSV
    return render(request, 'plantgrowth.html', {'plant_types': plant_types})

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