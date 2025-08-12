import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { ChatMessage, WebSocketMessage, WebSocketResponse, WebSocketAction } from "../../types";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import { PaletteMode } from "@mui/material/styles";

interface ChatWindowProps {
  selectedCollection: string | null;
  mode: PaletteMode;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedCollection, mode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket>();
  const [sessionId, setSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.REACT_APP_API_BASE_URL || ws) return;

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^http(s)?:\/\//, "");
    const websocket = new WebSocket(`ws://${baseUrl}/ws/chat`);
    setWs(websocket);

    websocket.onopen = () => console.log("WebSocket connected");

    websocket.onmessage = (event) => {
      const data: WebSocketResponse = JSON.parse(event.data);
      if (data.session_id) setSessionId(data.session_id);
      if (data.chunk) {
        setIsLoading(false);
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.isUser === false && !lastMessage?.id.includes("completed")) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + data.chunk },
            ];
          }
          return [
            ...prev,
            {
              id: `${data.session_id || "unknown"}-${Date.now()}`,
              content: data.chunk || "",
              isUser: false,
              timestamp: new Date().toLocaleTimeString(),
            },
          ];
        });
      }
      if (data.status === "completed") {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, id: `${lastMessage.id}-completed` },
            ];
          }
          return prev;
        });
      }
      if (data.error) {
        console.error("WebSocket error:", data.error);
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}`,
            content: "Failed to fetch data. Please try again.",
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    websocket.onclose = (event) => console.log("WebSocket closed:", event.code, event.reason);
    websocket.onerror = (error) => console.error("WebSocket error:", error);

    // return () => {
    //   if (websocket && websocket.readyState === WebSocket.OPEN) {
    //     websocket.send(JSON.stringify({ action: WebSocketAction.CLOSE, session_id: sessionId }));
    //     websocket.close();
    //   }
    // };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = () => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const message: WebSocketMessage = {
      action: WebSocketAction.CHAT,
      message: input,
      collection_name: selectedCollection,
      session_id: sessionId || undefined,
    };

    ws.send(JSON.stringify(message));
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        content: input,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setIsLoading(true);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const stopStreaming = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: WebSocketAction.STOP, session_id: sessionId }));
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: "400px",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mb: 2,
          pr: 1,
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "text.secondary",
            borderRadius: "4px",
          },
        }}
      >
        <List>
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <ListItem
                sx={{
                  justifyContent: msg.isUser ? "flex-end" : "flex-start",
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "70%",
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderRadius: 2,
                    p: 1,
                    boxShadow: 1,
                  }}
                >
                  <ListItemText primary={msg.content} />
                  <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: "text.secondary" }}>
                    {msg.timestamp}
                  </Typography>
                </Box>
              </ListItem>
              <Divider sx={{ bgcolor: "text.secondary" }} />
            </React.Fragment>
          ))}
          {isLoading && (
            <React.Fragment>
              <ListItem sx={{ justifyContent: "flex-start", py: 1 }}>
                <Box
                  sx={{
                    maxWidth: "70%",
                    bgcolor: "background.default",
                    borderRadius: 2,
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    boxShadow: 1,
                  }}
                >
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </Box>
              </ListItem>
              <Divider sx={{ bgcolor: "text.secondary" }} />
            </React.Fragment>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          size="small"
          sx={{
            "& .MuiInputBase-input": {
              color: "text.primary",
            },
            "& .MuiInputLabel-root": {
              color: "text.secondary",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            bgcolor: mode === "dark" ? "#cccccc" : "primary.main", // Light gray in dark mode
            color: mode === "dark" ? "text.primary" : "primary.contrastText", // Readable text
            "&:hover": {
              bgcolor: mode === "dark" ? "#bbbbbb" : "primary.dark", // Slightly darker gray on hover
            },
          }}
        >
          <SendIcon />
        </Button>
        <Button
          variant="outlined"
          onClick={stopStreaming}
          sx={{
            bgcolor: mode === "dark" ? "#cccccc" : "primary.main", // Light gray in dark mode
            color: mode === "dark" ? "text.primary" : "primary.contrastText", // Readable text
            "&:hover": {
              bgcolor: mode === "dark" ? "#bbbbbb" : "primary.dark", // Slightly darker gray on hover
            },
          }}
        >
          <StopIcon />
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatWindow;