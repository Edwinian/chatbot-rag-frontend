import React, { useState } from "react";
import { CollectionSelector, DocumentUpload, ChatWindow } from "./components";
import { ThemeProvider, Container, Typography, Box } from "@mui/material";
import theme from "./theme";

const App: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Chatbot
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <CollectionSelector onSelectCollection={setSelectedCollection} />
          <DocumentUpload selectedCollection={selectedCollection} />
          <ChatWindow selectedCollection={selectedCollection} />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;