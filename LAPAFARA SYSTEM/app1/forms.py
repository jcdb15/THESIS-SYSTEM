from django import forms
from .models import Member

class MemberForm(forms.ModelForm):
    class Meta:
        model = Member
        fields = [
            'first_name',
            'middle_name',
            'last_name',
            'gender',
                'birth_date',
            'address',
            'email',
            'contact_number',
            'employment_date',
            'photo',
        ]
        widgets = {
            'birth_date': forms.DateInput(attrs={'type': 'date'}),
            'employment_date': forms.DateInput(attrs={'type': 'date'}),
        }
