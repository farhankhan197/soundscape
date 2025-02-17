import numpy as np
import pyaudio
import wave
import librosa
import soundfile as sf
from sklearn.ensemble import RandomForestClassifier
from queue import Queue
import threading
import pickle
import os

class DrumSoundConverter:
    def __init__(self):
        self.CHUNK = 1024
        self.FORMAT = pyaudio.paFloat32
        self.CHANNELS = 1
        self.RATE = 44100
        self.sound_mappings = {}  # Maps sound labels to drum samples
        self.model = RandomForestClassifier(n_estimators=100)
        self.drum_samples = {}
        self.is_recording = False
        self.audio = pyaudio.PyAudio()
        
    def load_drum_sample(self, drum_name, file_path):
        """Load a drum sample and store it in memory."""
        audio, sr = librosa.load(file_path, sr=self.RATE)
        self.drum_samples[drum_name] = audio
        
    def record_training_sample(self, label, duration=1):
        """Record a training sample for a specific sound."""
        print(f"Recording training sample for {label}...")
        frames = []
        
        stream = self.audio.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=self.RATE,
            input=True,
            frames_per_buffer=self.CHUNK
        )
        
        for _ in range(0, int(self.RATE / self.CHUNK * duration)):
            data = stream.read(self.CHUNK)
            frames.append(np.frombuffer(data, dtype=np.float32))
            
        stream.stop_stream()
        stream.close()
        
        return np.concatenate(frames)
    
    def extract_features(self, audio):
        """Extract relevant audio features for classification."""
        mfccs = librosa.feature.mfcc(y=audio, sr=self.RATE, n_mfcc=13)
        spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=self.RATE)
        zero_crossing_rate = librosa.feature.zero_crossing_rate(audio)
        
        features = np.concatenate([
            mfccs.mean(axis=1),
            spectral_centroid.mean(axis=1),
            zero_crossing_rate.mean(axis=1),
        ])
        
        return features
    
    def train_model(self, samples_per_class=10):
        """Train the classifier on recorded samples."""
        X = []
        y = []
        
        for label in self.sound_mappings.keys():
            print(f"Recording training samples for {label}")
            for _ in range(samples_per_class):
                sample = self.record_training_sample(label)
                features = self.extract_features(sample)
                X.append(features)
                y.append(label)
                
        self.model.fit(X, y)
        
        # Save the trained model
        with open('sound_model.pkl', 'wb') as f:
            pickle.dump(self.model, f)
    
    def process_audio_file(self, input_file, output_file):
        """Convert an audio file using trained mappings."""
        print("Processing audio file...")
        audio, sr = librosa.load(input_file, sr=self.RATE)
        
        # Split audio into segments and process each
        segment_length = int(self.RATE)  # 1-second segments
        output_audio = np.array([])
        
        for i in range(0, len(audio), segment_length):
            segment = audio[i:i + segment_length]
            if len(segment) == segment_length:
                features = self.extract_features(segment)
                predicted_label = self.model.predict([features])[0]
                drum_sound = self.drum_samples[self.sound_mappings[predicted_label]]
                output_audio = np.concatenate([output_audio, drum_sound])
        
        # Save the processed audio
        sf.write(output_file, output_audio, self.RATE)
        
    def real_time_conversion(self):
        """Convert sounds to drums in real-time."""
        def audio_callback(in_data, frame_count, time_info, status):
            audio_data = np.frombuffer(in_data, dtype=np.float32)
            features = self.extract_features(audio_data)
            
            try:
                predicted_label = self.model.predict([features])[0]
                drum_sound = self.drum_samples[self.sound_mappings[predicted_label]]
                return (drum_sound.tobytes(), pyaudio.paContinue)
            except:
                return (in_data, pyaudio.paContinue)
        
        stream = self.audio.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=self.RATE,
            input=True,
            output=True,
            frames_per_buffer=self.CHUNK,
            stream_callback=audio_callback
        )
        
        print("Real-time conversion started. Press Ctrl+C to stop.")
        stream.start_stream()
        
        try:
            while stream.is_active():
                time.sleep(0.1)
        except KeyboardInterrupt:
            stream.stop_stream()
            stream.close()
            
    def map_sound(self, sound_label, drum_name):
        """Map a sound label to a drum type."""
        self.sound_mappings[sound_label] = drum_name

# Example usage
if __name__ == "__main__":
    converter = DrumSoundConverter()
    
    # Load drum samples
    converter.load_drum_sample("kick", "samples/kick.wav")
    converter.load_drum_sample("hihat", "samples/hihat.wav")
    converter.load_drum_sample("snare", "samples/snare.wav")
    
    # Map sounds to drums
    converter.map_sound("clap", "kick")
    converter.map_sound("tap", "hihat")
    
    # Train the model
    converter.train_model()
    
    # Option 1: Process an audio file
    converter.process_audio_file("input.wav", "output.wav")
    
    # Option 2: Real-time conversion
    converter.real_time_conversion()

