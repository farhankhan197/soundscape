from rest_framework import serializers
from .models import SoundAssignment

class SoundAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoundAssignment
        fields = ['drum_sound', 'sound_file']
