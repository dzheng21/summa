import React, { useState } from "react";

const ImageUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const callAzureApi = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("YOUR_AZURE_API_ENDPOINT", {
        method: "POST",
        body: formData,
        headers: {
          "Ocp-Apim-Subscription-Key": "YOUR_AZURE_API_KEY",
        },
      });

      const data = await response.json();
      setApiResponse(JSON.stringify(data));
    } catch (error) {
      console.error("Error calling Azure API:", error);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      callAzureApi(selectedFile);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          marginTop: "10px",
        }}
      >
        Drag and drop an image here
      </div>
      <button onClick={handleSubmit}>Upload and Process</button>
      {apiResponse && <div>API Response: {apiResponse}</div>}
    </div>
  );
};

export default ImageUploader;
