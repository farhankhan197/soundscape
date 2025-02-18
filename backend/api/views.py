from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SoundAssignment
from .serializers import SoundAssignmentSerializer
from pydub import AudioSegment
import os
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the Sound Classifier API!")

def get_default_drum_sounds():
    drum_sounds_directory = os.path.join('static', 'drum_sounds')
    default_sounds = ['drumkick.wav', 'clap.wav', 'snare.wav']  # List your drum sounds here
    sound_paths = [os.path.join(drum_sounds_directory, sound) for sound in default_sounds]
    return sound_paths

@api_view(['POST'])
def convert_audio(request):
    """Handle audio file conversion with default or custom drum sounds"""
    audio_file = request.FILES.get('audioFile')
    drum_sound = request.data.get('drumSound')  # Get drum sound from the request

    if not drum_sound:  # If no drum sound is provided, use the default drum sound
        drum_sound = 'drumkick.wav'  # Default drum sound

    if audio_file:
        # Process the audio file and use the drum sound (from default or custom)
        sound = AudioSegment.from_file(audio_file)
        
        # Implement your logic to replace the detected sound with the selected drum sound
        # Save the converted file
        converted_path = os.path.join('media/converted', f'converted_{audio_file.name}')
        sound.export(converted_path, format="wav")

        return Response({"message": "Audio converted", "file": converted_path}, status=200)

    return Response({"error": "Invalid audio file"}, status=400)

    
@api_view(['POST'])
def assign_sound(request):
    """Handle sound assignment (upload sound file and associate with a drum sound)"""
    drum_sound = request.data.get("drumSound")
    sound_file = request.FILES.get("sound")

    if drum_sound and sound_file:
        # Save the sound file
        sound_path = os.path.join('media/sounds', sound_file.name)
        with open(sound_path, 'wb') as f:
            for chunk in sound_file.chunks():
                f.write(chunk)

        # Create a new sound assignment entry
        SoundAssignment.objects.create(drum_sound=drum_sound, sound_file=sound_path)

        return Response({"message": "Sound assigned successfully!"}, status=200)
    return Response({"error": "Invalid request"}, status=400)

@api_view(['POST'])
def convert_audio(request):
    """Handle audio file conversion"""
    audio_file = request.FILES.get('audioFile')

    if audio_file:
        # Process the audio file (e.g., detect claps and replace with drum sounds)
        sound = AudioSegment.from_file(audio_file)
        
        # Here you could implement your logic to detect claps, taps, etc., and replace them with drum sounds
        # For simplicity, let's say we just save the uploaded file for now
        converted_path = os.path.join('media/converted', f'converted_{audio_file.name}')
        sound.export(converted_path, format="wav")

        return Response({"message": "Audio converted", "file": converted_path}, status=200)

    return Response({"error": "Invalid audio file"}, status=400)
