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
                    This is a Retrieval-Augmented Generation (RAG) chatbot application built with FastAPI, LangChain, and ChromaDB. It features a user-friendly chat window for real-time interaction with a conversational AI, powered by HuggingFace models, and supports queries enriched with document context and optional web search integration. The application also includes a dedicated page for uploading documents (PDF, DOCX, TXT, PNG, .etc) to be embedded into ChromaDB for retrieval, with automatic PII redaction for enhanced privacy. SQLite is used for storing chat logs and document metadata, ensuring persistence and traceability.
                </Typography>
            </Box>
        </PageContainer>
    );
};

export default About;