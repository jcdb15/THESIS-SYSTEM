from django import forms
from .models import Plant


class PlantForm(forms.ModelForm):
    class Meta:
        model = Plant
        fields = ["name", "plant_type", "care_instructions", "description", "location", "photo", "quantity"]