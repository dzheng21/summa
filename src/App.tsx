import React from "react";
import HelloWorld from "./components/HelloWorld.tsx"; // Ensure this file exists in the src/components directory
import ImageUploader from "./components/ImageUploader.tsx"; // Ensure this file exists in the src/components directory

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Image Upload and Process</h1>
      <HelloWorld />
      <ImageUploader />
    </div>
  );
};

export default App;
