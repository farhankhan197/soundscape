from django.db import models

class SoundAssignment(models.Model):
    drum_sound = models.CharField(max_length=100)
    sound_file = models.FileField(upload_to='sounds/')  # Upload path

    def __str__(self):
        return f"{self.drum_sound} -> {self.sound_file.name}"

