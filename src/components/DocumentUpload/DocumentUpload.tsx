import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { uploadDocument } from '../../api';
import { AxiosError } from 'axios';

interface DocumentUploadProps {
  selectedCollection: string | null;
  setMessage: (value: React.SetStateAction<string | null>) => void
  onUploadSuccess: (message: string) => void; // Callback for successful upload
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ selectedCollection, onUploadSuccess, setMessage }) => {
  const [isUploading, setIsUploading] = useState(false);
  const allowedExtensions = useMemo(() => [".pdf", ".docx", ".txt", ".jpg", ".jpeg", ".png"], []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        setMessage('Please select a valid .pdf, .docx, or .html file.');
        return;
      }

      const file = acceptedFiles[0];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        setMessage('Please select a valid file.');
        return;
      }

      setIsUploading(true);
      setMessage(null);
      try {
        const response = await uploadDocument(file, selectedCollection);

        if (response.message) {
          onUploadSuccess(response.message); // Trigger callback
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          setMessage(error.response?.data?.detail);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [selectedCollection, onUploadSuccess, setMessage, allowedExtensions]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/html': ['.html'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" color="text.primary">
        Upload Document
      </Typography>
      <Paper
        {...getRootProps()}
        sx={{
          p: 2,
          border: `2px dashed ${isDragActive ? 'primary.main' : 'text.secondary'}`,
          borderRadius: 2,
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          color: 'text.primary',
          '&:hover': {
            bgcolor: isUploading ? 'background.paper' : 'action.hover',
          },
          opacity: isUploading ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body1">
          {isUploading
            ? 'Uploading...'
            : isDragActive
              ? 'Drop the file here...'
              : `Drag and drop a file here, or click to select (${allowedExtensions.join(', ')})`}
        </Typography>
        {isUploading && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={20} color="primary" />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DocumentUpload;