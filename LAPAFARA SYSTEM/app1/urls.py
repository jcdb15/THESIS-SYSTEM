from django.urls import path
from . import views
from django.urls import path
from app1 import views
from django.contrib.auth import views as auth_views
from django.urls import path
from app1.views import check_new_user
from .views import get_plant_types
from django.conf import settings
from django.conf.urls.static import static
from . import views
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet
from rest_framework import routers
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'members', MemberViewSet)
router = DefaultRouter()
router.register(r'members', MemberViewSet, basename='member')


urlpatterns = [
    path('upload_csv/', views.upload_csv, name='upload_csv'),
    path('harvest-calendar/', views.harvest_calendar_view, name='harvest_calendar'),
    path('historical-data/', views.historical_data_view, name='historical_data'),
    path('load-historical-data/', views.load_historical_data, name='load_historical_data'),
    path('add-row/', views.add_row, name='add_row'),
    path('delete-row/', views.delete_row, name='delete_row'),   
    path('api/', include(router.urls)),
    path('get_plants/', get_plant_types, name='get_plants'),
    path('member/edit/<int:pk>/', views.edit_member, name='edit_member'),
    path('Historical_data/', views.historical_data_view, name='Historical_data'),
    path('delete-plant/<int:plant_id>/', views.delete_plant, name='delete_plant'),
    path('get_plants/', get_plant_types, name='get_plants'),
    path('predict-yield/', views.predict_yield_api, name='predict_yield'),




    path('add_member/', views.add_member_view, name='add_member'),
    path('', views.sign_up_page, name='signup'),
    path('login/', views.login_page, name='login'),
    path('home/', views.home_page, name='home'),
    path('logout/', views.logout_page, name='logout'),
    path('member/', views.member_view, name='member'),
    path('plants/', views.plants_view, name='plants'),
    # Calendar and Events
    path('calendar/', views.calendar_view, name='calendar'),
    path('api/add-event/', views.add_event, name='add_event'),
    path('api/get-events/', views.get_events, name='get_events'),
    path('api/delete-event/', views.delete_event, name='delete_event'),
    path('api/clear-all-events/', views.clear_all_events, name='clear_all_events'),

    
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

    