from django.urls import path
from . import views
from django.urls import path
from app1 import views
from django.contrib.auth import views as auth_views
from django.urls import path
from app1.views import check_new_user
from .views import predict_growth_api
from .views import get_plant_types
from django.conf import settings
from django.conf.urls.static import static
from . import views





urlpatterns = [
    path("predict_growth_api/", predict_growth_api, name="predict_growth_api"),
    path('get_plants/', get_plant_types, name='get_plants'),


    path('', views.sign_up_page, name='signup'),
    path('login/', views.login_page, name='login'),
    path('home/', views.home_page, name='home'),
    path('logout/', views.logout_page, name='logout'),
    path('member/', views.member_view, name='member'),
    path('plants/', views.plants_view, name='plants'),
    path('calendar/', views.calendar_view, name='calendar'),
    path('memberlist/', views.memberlist_view, name='memberlist'),
    path('about/', views.about_view, name='about'),
    path('plantdatabase/', views.plantdatabase_view, name='plantdatabase'),
    path('plantgrowth/', views.plantgrowth_view, name='plantgrowth'),
    path('profile/', views.profile_view, name='profile'),

    #FORGOT PASSWORD START
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name='Forgotpassword/password_reset_form.html'), name='password_reset'),
    path('password_reset_done/', auth_views.PasswordResetDoneView.as_view(template_name='Forgotpassword/password_reset_done.html'), name='password_reset_done'),
    path('password_reset_confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='Forgotpassword/password_reset_confirm.html'), name='password_reset_confirm'),
    path('password_reset_complete', auth_views.PasswordResetCompleteView.as_view(template_name='Forgotpassword/password_reset_complete.html'), name='password_reset_complete'),
    #FORGOT PASSWORD END

    path('check_new_user/', check_new_user, name='check_new_user'),
    path('users/', views.user_list, name='user_list'),  # Ensure this line exists

    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    