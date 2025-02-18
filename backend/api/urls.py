# backend/api/urls.py

from django.urls import path,include
from . import views  # Import the views from api/views.py
import api.views

urlpatterns = [
    path('', views.home, name='home'),
    path('assign-sound/', views.assign_sound, name='assign_sound'),
    path('convert-audio/', views.convert_audio, name='convert_audio'),
    path('convert-audio/', views.convert_audio, name='convert_audio'),
    # Add more API routes as needed
]
