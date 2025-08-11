import React, { useState } from "react";
import { uploadDocument } from "../../api";
import "./DocumentUpload.css";

interface DocumentUploadProps {
  selectedCollection: string | null;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ selectedCollection }) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
    try {
      const response = await uploadDocument(file, selectedCollection);
      setMessage(response.message);
      setFile(null);
    } catch (error) {
      setMessage("Failed to upload document.");
      console.error(error);
    }
  };

  return (
    <div className="document-upload">
      <h3>Upload Document</h3>
      <input type="file" accept=".pdf,.docx,.html" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default DocumentUpload;