import React, { useState } from 'react';
import axios from 'axios';

const AudioConverter = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedDrumSound, setSelectedDrumSound] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!audioFile || !selectedDrumSound) {
      alert("Please select an audio file and a drum sound.");
      return;
    }

    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('drumSound', selectedDrumSound);

    try {
      const response = await axios.post('/api/convert-audio/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error converting audio:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <select onChange={(e) => setSelectedDrumSound(e.target.value)}>
        <option value="">Select a drum sound</option>
        <option value="drumkick.wav">Drumkick</option>
        <option value="clap.wav">Clap</option>
        <option value="snare.wav">Snare</option>
      </select>
      <button onClick={handleSubmit}>Convert Audio</button>
    </div>
  );
};

export default AudioConverter;
