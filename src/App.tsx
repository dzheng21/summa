import React, { useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState(null);

  const callAzureFunction = async () => {
    try {
      const response = await axios.get("/api/call_azure");
      setData(response.data);
    } catch (error) {
      console.error("Error calling Azure function:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Call Azure Endpoint</h1>
        <button onClick={callAzureFunction}>Call Azure</button>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </header>
    </div>
  );
}

export default App;
