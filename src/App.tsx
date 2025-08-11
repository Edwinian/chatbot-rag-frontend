import React, { useState } from "react";
import { CollectionSelector, DocumentUpload, ChatWindow } from "./components";
import "./App.css";

const App: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  return (
    <div className="app">
      <h1>Chatbot</h1>
      <CollectionSelector onSelectCollection={setSelectedCollection} />
      <DocumentUpload selectedCollection={selectedCollection} />
      <ChatWindow selectedCollection={selectedCollection} />
    </div>
  );
};

export default App;