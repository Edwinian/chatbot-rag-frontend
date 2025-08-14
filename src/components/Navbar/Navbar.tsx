import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { PaletteMode } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import { RoutePath } from '../../types';

interface NavbarProps {
    mode: PaletteMode;
    toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ mode, toggleTheme }) => {
    const location = useLocation();
    const navBars = [
        { name: 'Home', path: RoutePath.HOME },
        { name: 'About', path: RoutePath.ABOUT },
        { name: 'Document', path: RoutePath.DOCUMENT },
    ]

    return (
        <AppBar position="static" sx={{ bgcolor: 'background.paper', boxShadow: 1, borderRadius: 0 }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" color="text.primary">
                    Edwin's Chatbot
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {navBars.map(({ name, path }) => (<Button
                        key={name}
                        color={location.pathname === path ? 'primary' : 'inherit'}
                        component={Link}
                        to={path}
                        sx={{ color: 'text.primary', fontSize: "large" }}
                    >
                        {name}
                    </Button>))}
                </Box>
                <IconButton
                    onClick={toggleTheme}
                    sx={{ color: mode === 'light' ? 'text.secondary' : '#f3f2e9ff' }}
                    aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                    {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;