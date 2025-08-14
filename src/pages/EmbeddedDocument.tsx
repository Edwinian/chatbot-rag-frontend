import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import PageContainer from '../components/PageContainer/PageContainer';
import DocumentUpload from '../components/DocumentUpload/DocumentUpload';
import { DocumentInfo, DeleteFileRequest, PageProps } from '../types';
import { deleteDocument, fetchDocuments } from '../api';
import DeleteIcon from '@mui/icons-material/Delete';

const EmbeddedDocument: React.FC<PageProps> = ({ mode, selectedCollection }) => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Styles
  const headerStyle = { fontWeight: 'bold' }
  const rowStyle = { padding: '0px' }

  // Fetch documents from backend
  const fetchMany = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDocuments()
      setDocuments(data);
    } catch (err) {
      setError('Failed to fetch documents.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete document
  const deleteOne = useCallback(async (file_id: number) => {
    try {
      const data = await deleteDocument({ file_id } as DeleteFileRequest);

      if (data.error) {
        throw new Error(data.error || 'Failed to delete document.');
      }

      if (data.message) {
        setMessage(data.message);
        await fetchMany(); // Refetch documents after deletion
      }
    } catch (err) {
      setError('Failed to delete document.');
      console.error(err);
    }
  }, [fetchMany]);

  // Callback for DocumentUpload to trigger refetch
  const handleUploadSuccess = useCallback(
    (uploadMessage: string) => {
      setMessage(uploadMessage);
      fetchMany(); // Refetch documents after upload
    },
    [fetchMany]
  );

  // Fetch documents on mount
  useEffect(() => {
    fetchMany();
  }, [fetchMany]);

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '1200px', px: { xs: 0, sm: 2 } }}>
        {/* Document Upload Section */}
        <DocumentUpload
          selectedCollection={selectedCollection || null} // Use prop or null
          mode={mode}
          onUploadSuccess={handleUploadSuccess} // Pass callback for refetch
        />
        {message && (
          <Typography
            variant="body2"
            color={message.includes('Failed') ? 'error.main' : 'success.main'}
          >
            {message}
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        )}

        {/* Embedded Document List Table */}
        <Typography variant="h6" color="text.primary">
          Embedded Document List
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} color="primary" />
          </Box>
        ) : documents.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No documents found.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="Embedded Document List table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ ...headerStyle, paddingLeft: '50px' }}>File Name</TableCell>
                  <TableCell align="center" sx={headerStyle}>Upload Time</TableCell>
                  <TableCell align="center" sx={headerStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map(({ id, filename, upload_timestamp }) => (
                  <TableRow key={id}>
                    <TableCell align="left" sx={{ ...rowStyle, paddingLeft: '50px' }}>{filename}</TableCell>
                    <TableCell align="center" sx={rowStyle}>{new Date(upload_timestamp).toLocaleString()}</TableCell>
                    <TableCell align="center" sx={rowStyle}>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => deleteOne(id)}
                        disabled={isLoading} // Disable during loading
                        sx={{ margin: '5px' }}
                      >
                        <DeleteIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </PageContainer>
  );
};

export default EmbeddedDocument;