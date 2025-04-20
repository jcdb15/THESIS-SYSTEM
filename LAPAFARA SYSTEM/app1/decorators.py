# yourapp/decorators.py
from django.http import HttpResponse
from django.shortcuts import redirect

# 1. Prevent logged-in users from accessing login/register pages
def unauthenticated_user(view_func):
    def wrapper_func(request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')  # Replace with your actual homepage URL name
        else:
            return view_func(request, *args, **kwargs)
    return wrapper_func

# 2. Allow access only to users in allowed_roles
def allowed_users(allowed_roles=[]):
    def decorator(view_func):
        def wrapper_func(request, *args, **kwargs):
            group = None
            if request.user.groups.exists():
                group = request.user.groups.all()[0].name

            if group in allowed_roles:
                return view_func(request, *args, **kwargs)
            else:
                return HttpResponse("You are not authorized to view this page.")
        return wrapper_func
    return decorator

# 3. Allow only admins; redirect others
def admin_only(view_func):
    def wrapper_func(request, *args, **kwargs):
        group = None
        if request.user.groups.exists():
            group = request.user.groups.all()[0].name

        if group == 'admin':
            return view_func(request, *args, **kwargs)
        elif group == 'customer':
            return redirect('user-dashboard')  # Replace with your user dashboard view name
        else:
            return HttpResponse("Unauthorized access.")
    return wrapper_func
