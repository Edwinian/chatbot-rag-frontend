import React, { useState } from "react";
import { DocumentUpload, ChatWindow } from "./components";
import { ThemeProvider, Container, Typography, Box, IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { PaletteMode } from "@mui/material/styles";
import theme from "./theme";

const App: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [mode, setMode] = useState<PaletteMode>("dark");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme(mode)}>
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
          bgcolor: "background.default",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100vw",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: "1200px",
            mb: 2,
            px: { xs: 0, sm: 2 },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            color="text.primary"
            sx={{ textAlign: "center", flexGrow: 1 }}
          >
            Edwin's Chatbot
          </Typography>
          <IconButton
            onClick={toggleTheme}
            sx={{ color: mode === "light" ? "text.secondary" : "#f3f2e9ff" }}
            aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {mode === "light" ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            width: "100%",
            maxWidth: "1200px",
            px: { xs: 0, sm: 2 },
          }}
        >
          {/* <CollectionSelector onSelectCollection={setSelectedCollection} /> */}
          <DocumentUpload selectedCollection={selectedCollection} mode={mode} />
          <ChatWindow selectedCollection={selectedCollection} mode={mode} />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;