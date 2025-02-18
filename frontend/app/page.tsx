"use client"
import { useEffect, useState } from "react";
import AudioUpload from "./components/AudioUpload";
import DrumSoundSelector from "./components/DrumSelector";
import AudioConverter from "./components/AudioConverter";

export default function SoundClassifier() {
  const [drumSounds, setDrumSounds] = useState(["Drumkick", "Hi-hat", "Snare"]);
  const [selectedDrum, setSelectedDrum] = useState<string | null>(null);
  const [assignedSounds, setAssignedSounds] = useState<{ [key: string]: string }>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSound, setRecordedSound] = useState<Blob | null>(null);

  // Handle sound assignment
  const assignSound = async (drumSound: string) => {
    if (recordedSound) {
      const formData = new FormData();
      formData.append("drumSound", drumSound);
      formData.append("sound", recordedSound);

      try {
        await fetch("/api/assign-sound", {
          method: "POST",
          body: formData,
        });
        setAssignedSounds((prev) => ({ ...prev, [drumSound]: URL.createObjectURL(recordedSound) }));
      } catch (error) {
        console.error("Error assigning sound:", error);
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Implement recording logic here (e.g., using the Web Audio API)
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Implement logic to stop recording and get audio Blob
    // For now, just setting a placeholder for recorded sound
    setRecordedSound(new Blob()); // Replace with actual recorded Blob
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">Sound Classifier</h1>
      <div>
        <h2>Assign Sounds to Drum</h2>
        {drumSounds.map((drumSound) => (
          <div key={drumSound}>
            <button
              onClick={() => setSelectedDrum(drumSound)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Assign {drumSound}
            </button>
            {selectedDrum === drumSound && (
              <>
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                >
                  Start Recording
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                >
                  Stop Recording
                </button>
                <button
                  onClick={() => assignSound(drumSound)}
                  className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Assign to {drumSound}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-lg">Assigned Sounds:</p>
      {Object.keys(assignedSounds).map((drum) => (
        <div key={drum}>
          <p>{drum} - <audio controls src={assignedSounds[drum]} /></p>
        </div>
      ))}
    <AudioUpload/>
    <DrumSoundSelector />
    <AudioConverter />
    </div>
  );
}
