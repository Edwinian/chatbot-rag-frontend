import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { uploadDocument } from "../../api";

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Upload Document</Typography>
      <TextField
        type="file"
        onChange={handleFileChange}
        InputProps={{ inputProps: { accept: ".pdf,.docx,.html" } }}
        variant="outlined"
        size="small"
      />
      <Button variant="contained" onClick={handleUpload}>
        Upload
      </Button>
      {message && (
        <Typography
          variant="body2"
          color={message.includes("Failed") ? "error" : "success"}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default DocumentUpload;