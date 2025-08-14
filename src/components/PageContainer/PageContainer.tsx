import React from 'react';
import { Container, ContainerTypeMap } from '@mui/material';

interface PageContainerProps extends Partial<ContainerTypeMap['props']> {
    children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, disableGutters = true, maxWidth = false, sx, ...props }) => {
    return (
        <Container
            disableGutters={disableGutters} // Removes default padding
            maxWidth={maxWidth} // Disables maxWidth constraints
            sx={{
                py: 4,
                minHeight: 'calc(100vh - 64px)', // Adjust for AppBar height
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100vw', // Full viewport width
                ...sx
            }}
            {...props}
        >
            {children}
        </Container>
    );
};

export default PageContainer;