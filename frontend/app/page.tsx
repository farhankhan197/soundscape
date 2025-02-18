"use client"
import { useEffect, useState, useRef } from "react";
import AudioUpload from "./components/AudioUpload";
import DrumSoundSelector from "./components/DrumSelector";
import AudioConverter from "./components/AudioConverter";

export default function SoundClassifier() {
  const [drumSounds] = useState(["Drumkick", "Hi-hat", "Snare"]);
  const [selectedDrum, setSelectedDrum] = useState<string | null>(null);
  const [assignedSounds, setAssignedSounds] = useState<{ [key: string]: string }>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSound, setRecordedSound] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Handle sound assignment
  const assignSound = async (drumSound: string) => {
    if (recordedSound) {
      setAssignedSounds((prev) => ({ ...prev, [drumSound]: URL.createObjectURL(recordedSound) }));
    }
  };

  // Start Recording
  const startRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setRecordedSound(audioBlob);
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="p-6 text-center bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800">Sound Classifier</h1>
      <div className="mt-6 bg-white p-6 shadow-lg rounded-lg w-full max-w-lg">
        <h2 className="text-lg font-semibold">Assign Sounds to Drum</h2>
        {drumSounds.map((drumSound) => (
          <div key={drumSound} className="my-4">
            <button
              onClick={() => setSelectedDrum(drumSound)}
              className={`px-4 py-2 rounded ${selectedDrum === drumSound ? "bg-blue-600" : "bg-blue-500"} text-white transition-all`}
            >
              Assign {drumSound}
            </button>
            {selectedDrum === drumSound && (
              <div className="mt-4 space-x-2 flex justify-center">
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
                >
                  Start Recording
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
                >
                  Stop Recording
                </button>
                <button
                  onClick={() => assignSound(drumSound)}
                  disabled={!recordedSound}
                  className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
                >
                  Assign to {drumSound}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recording Animation */}
      {isRecording && (
        <div className="mt-4 w-10 h-10 bg-red-500 rounded-full animate-ping"></div>
      )}

      {/* Assigned Sounds */}
      <div className="mt-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold">Assigned Sounds</h2>
        {Object.keys(assignedSounds).map((drum) => (
          <div key={drum} className="mt-2 p-2 bg-white shadow-md rounded-lg">
            <p className="font-medium">{drum}</p>
            <audio controls src={assignedSounds[drum]} className="mt-2 w-full" />
          </div>
        ))}
      </div>

      <AudioUpload />
      <DrumSoundSelector />
      <AudioConverter />
    </div>
  );
}
