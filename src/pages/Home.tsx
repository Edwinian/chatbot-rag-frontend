import React from 'react';
import { Box } from '@mui/material';
import { ChatWindow } from '../components';
import PageContainer from '../components/PageContainer/PageContainer';
import { PageProps } from '../types';

const Home: React.FC<PageProps> = ({ selectedCollection, setSelectedCollection, mode }) => {
    return (
        <PageContainer
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    width: '100%',
                    maxWidth: '1200px',
                    px: { xs: 0, sm: 2 },
                }}
            >
                <ChatWindow selectedCollection={selectedCollection} mode={mode} />
            </Box>
        </PageContainer>
    );
};

export default Home;