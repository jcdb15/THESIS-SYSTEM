from django import forms
from .models import Plant, Member
from .models import HistoricalData



class PlantForm(forms.ModelForm):
    class Meta:
        model = Plant
        fields = ["name", "plant_type", "care_instructions", "location", "photo", "quantity"]

class MemberForm(forms.ModelForm):
    class Meta:
        model = Member
        fields = ['first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'address', 
                  'email', 'contact_number', 'employment_date', 'photo']
        
class HistoricalDataForm(forms.ModelForm):
    class Meta:
        model = HistoricalData
        fields = '__all__'
