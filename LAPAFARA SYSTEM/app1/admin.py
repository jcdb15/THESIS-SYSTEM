
from django.contrib import admin
from .models import Plant, Event, Member


admin.site.register(Member)
class MemberAdmin(admin.ModelAdmin):
     list_display = [field.name for field in Member._meta.get_fields()]
@admin.register(Plant)

class PlantAdmin(admin.ModelAdmin):
    list_display = ("name", "quantity")
    search_fields = ("name",)  # Tinanggal na ang 'plant_type'


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date')
    search_fields = ('title',)
    list_filter = ('date',)

admin.site.site_header = "LAPAFARA AI INC"
admin.site.site_title = "Lapafara Irrigators Association Incorporated Admin"
admin.site.index_title = "Lapafara Irrigators Association Incorporated Admin"
