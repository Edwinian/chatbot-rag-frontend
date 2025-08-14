import React from 'react';
import { Typography, Box } from '@mui/material';
import PageContainer from '../components/PageContainer/PageContainer';

const About: React.FC = () => {
    return (
        <PageContainer
            sx={{
                maxWidth: '50%'
            }}
        >
            <Box >
                <Typography variant="h4" color="text.primary" gutterBottom sx={{ textAlign: 'center' }}>
                    About Edwin's Chatbot
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'start' }}>
                    This chatbot application allows users to upload documents and interact with an AI-powered chat interface.
                    It supports document uploads in PDF, DOCX, and HTML formats and provides real-time chat functionality
                    using WebSocket for seamless communication.
                </Typography>
            </Box>
        </PageContainer>
    );
};

export default About;