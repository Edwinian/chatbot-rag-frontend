import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { PaletteMode } from '@mui/material/styles';
import theme from './theme';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './components/Navbar/Navbar';
import EmbeddedDocument from './pages/EmbeddedDocument';
import { RoutePath } from './types';

const App: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<string>();
  const [mode, setMode] = useState<PaletteMode>('dark');
  const routes = [
    { path: RoutePath.HOME, component: Home },
    { path: RoutePath.ABOUT, component: About },
    { path: RoutePath.DOCUMENT, component: EmbeddedDocument },
  ]

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme(mode)}>
      <Router>
        <Navbar mode={mode} toggleTheme={toggleTheme} />
        <Routes>
          {
            routes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Component
                    selectedCollection={selectedCollection}
                    setSelectedCollection={setSelectedCollection}
                    mode={mode}
                  />
                }
              />
            ))
          }
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;