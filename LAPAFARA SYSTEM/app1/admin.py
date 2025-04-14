
from django.contrib import admin
from .models import Plant
from .models import Event


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ("name", "plant_type", "location", "quantity")
    search_fields = ("name", "plant_type")

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date')
    search_fields = ('title',)
    list_filter = ('date',)

admin.site.site_header = "LAPAFARA AI INC"
admin.site.site_title = "Lapafara Irrigators Association Incorporated Admin"
admin.site.index_title = "Lapafara Irrigators Association Incorporated Admin"
