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

def plantgrowth_view(request):
        
        return render(request, 'plantgrowth.html')

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

