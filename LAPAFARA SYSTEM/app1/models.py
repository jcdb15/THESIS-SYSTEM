from django.db import models
from django.contrib.auth.models import User

class Member(models.Model):
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10)
    birth_date = models.DateField()
    address = models.CharField(max_length=255)
    email = models.EmailField()
    contact_number = models.CharField(max_length=15)
    employment_date = models.DateField()
    photo = models.ImageField(upload_to='members_photos/', blank=True, null=True)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'



class Plant(models.Model):
    name = models.CharField(max_length=100)
    plant_type = models.CharField(max_length=50)
    care_instructions = models.TextField()
    description = models.TextField()
    location = models.CharField(max_length=10, choices=[('Indoor', 'Indoor'), ('Outdoor', 'Outdoor')])
    photo = models.ImageField(upload_to='plants/', blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.name
    
class Event(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateTimeField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%Y-%m-%d')}"
    
class PlantEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Associate this model with the User model
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name