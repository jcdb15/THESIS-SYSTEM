
from django.contrib import admin
from .models import Plant


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ("name", "plant_type", "location", "quantity")
    search_fields = ("name", "plant_type")

admin.site.site_header = "LAPAFARA AI INC"
admin.site.site_title = "Lapafara Irrigators Association Incorporated Admin"
admin.site.index_title = "Lapafara Irrigators Association Incorporated Admin"
