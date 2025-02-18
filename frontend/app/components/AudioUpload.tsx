import React, { useState } from "react";

const AudioUpload = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("audioFile", audioFile);

    try {
      const response = await fetch("/api/convert-audio", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Converted Audio:", data);
      // Handle success response (e.g., show converted audio or a success message)
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="border p-2"
      />
      {audioFile && <p>Selected File: {audioFile.name}</p>}
      <button
        onClick={handleUpload}
        disabled={uploading || !audioFile}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload Audio"}
      </button>
    </div>
  );
};

export default AudioUpload;
