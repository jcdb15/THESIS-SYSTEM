from django.contrib import admin
from .models import Member


admin.site.site_header = "LAPAFARA AI INC"
admin.site.site_title = "Lapafara Irrigators Association Incorporated Admin"
admin.site.index_title = "Lapafara Irrigators Association Incorporated Admin"


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'gender')  # Customize fields as needed
    search_fields = ('first_name', 'last_name', 'email')  # Enable search functionality
    list_filter = ('gender', 'employment_date')  # Add filters in the admin panel
