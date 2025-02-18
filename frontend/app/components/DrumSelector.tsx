import React, { useState, useEffect } from 'react';

const DrumSoundSelector = () => {
  const [drumSounds, setDrumSounds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch all drum sound files from the public directory
    const sounds = [
      'drumkick.wav',
      'hihat.wav',
      'snare.wav',
      // Add other drum sound files here
    ];
    setDrumSounds(sounds);
  }, []);

  return (
    <div>
      <h3>Select Drum Sound</h3>
      <ul>
        {drumSounds.map((sound, index) => (
          <li key={index}>
            <button onClick={() => alert(`Playing ${sound}`)}>
              {sound}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DrumSoundSelector;
