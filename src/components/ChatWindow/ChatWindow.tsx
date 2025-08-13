import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { WebSocketMessage, WebSocketResponse, WebSocketAction, ChatWindowProps, ChatMessage, StructuredChunk, StructuredChunkType } from "../../types";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedCollection, mode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initializeWebSocket = useCallback((): WebSocket | null => {
    if (!process.env.REACT_APP_API_BASE_URL) {
      console.error("WebSocket error: REACT_APP_API_BASE_URL is undefined or empty");
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          content: ["Failed to connect to WebSocket. Please check server configuration."],
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Updated
        },
      ]);
      return null;
    }

    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^http(s)?:\/\//, "");
    try {
      const websocket = new WebSocket(`ws://${baseUrl}/ws/chat`);
      websocket.onopen = () => {
        console.log("WebSocket connected");
        setIsLoading(false);
      };

      websocket.onmessage = (event) => {
        try {
          const data: WebSocketResponse = JSON.parse(event.data);
          if (data.session_id) setSessionId(data.session_id);
          if (data.chunk) {
            setIsLoading(false);
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              const chunk: StructuredChunk = data.chunk;
              if (lastMessage?.isUser === false && !lastMessage?.id.includes("completed")) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: [...lastMessage.content, chunk] },
                ];
              }
              return [
                ...prev,
                {
                  id: `${data.session_id || "unknown"}-${Date.now()}`,
                  content: [chunk],
                  isUser: false,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Updated
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
                content: ["Failed to fetch data. Please try again."],
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Updated
              },
            ]);
          }
        } catch (error) {
          console.error("WebSocket message parsing error:", error);
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}`,
              content: ["Error processing server response."],
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Updated
            },
          ]);
        }
      };

      websocket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setWs(null);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWs(null);
      };

      return websocket;
    } catch (error) {
      console.error("WebSocket initialization error:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (ws) return;

    const websocket = initializeWebSocket();
    if (websocket) setWs(websocket);
  }, [ws, initializeWebSocket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const message: WebSocketMessage = {
      action: WebSocketAction.CHAT,
      message: input,
      collection_name: selectedCollection,
      session_id: sessionId || undefined,
    };

    const send = (ws: WebSocket) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}`,
            content: [input],
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Updated
          },
        ]);
        setIsLoading(true);
        setInput("");
      } else {
        console.error("WebSocket not open:", ws.readyState);
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}`,
            content: ["Failed to send message. WebSocket not connected."],
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Updated
          },
        ]);
      }
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
      send(ws);
    } else {
      const newWs = initializeWebSocket();
      if (newWs) {
        setWs(newWs);
        newWs.onopen = () => {
          console.log("WebSocket opened for message send");
          send(newWs);
        };
      }
    }
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

  const renderChunk = (chunk: string | StructuredChunk, index: number) => {
    if (typeof chunk === "string") {
      return (
        <Typography key={index} variant="body2">
          {chunk}
        </Typography>
      );
    }

    const parseContent = (content: string) => {
      // Split content into parts, capturing text and <b>wrapped text
      const parts = content.split(/(<b>[^<]+<\/b>)/g);

      return parts.map((part, i) => {
        const match = part.match(/^<b>(.*?)<\/b>$/);

        if (match) {
          // Render the text inside <b> tags with bold styling
          return (
            <Typography
              key={`${index}-${i}`}
              component="span"
              variant="inherit"
              sx={{ fontWeight: "bold" }}
            >
              {match[1]}
            </Typography>
          );
        }

        return <Typography key={`${index}-${i}`} component="span" variant="inherit">{part}</Typography>;
      });
    };

    switch (chunk.type) {
      case StructuredChunkType.HEADING:
        return (
          <Typography
            key={index}
            variant="h6"
            sx={{ fontWeight: "bold", mt: 1 }}
          >
            {parseContent(chunk.content)}
          </Typography>
        );
      case StructuredChunkType.BULLET:
        return (
          <ListItem key={index} sx={{ display: "list-item", pl: 2, py: 0.5 }}>
            <ListItemText primary={parseContent(chunk.content)} />
          </ListItem>
        );
      case StructuredChunkType.PARAGRAPH:
        return (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            {parseContent(chunk.content)}
          </Typography>
        );
      default:
        return (
          <Typography key={index} variant="body2">
            {parseContent(chunk.content)}
          </Typography>
        );
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
                  {msg.isUser ? (
                    <Typography variant="body2">{typeof msg.content[0] === 'string' ? msg.content[0] : msg.content[0].content}</Typography>
                  ) : (
                    <List sx={{ p: 0 }}>{msg.content.map(renderChunk)}</List>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ display: "block", textAlign: "right", color: "text.secondary" }}
                  >
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
            "& .MuiInputBase-input": { color: "text.primary" },
            "& .MuiInputLabel-root": { color: "text.secondary" },
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            bgcolor: mode === "dark" ? "#cccccc" : "primary.main",
            color: mode === "dark" ? "text.primary" : "primary.contrastText",
            "&:hover": { bgcolor: mode === "dark" ? "#bbbbbb" : "primary.dark" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "8px",
            minWidth: "48px",
          }}
          aria-label="Send message"
        >
          <SendIcon />
        </Button>
        <Button
          variant="contained"
          onClick={stopStreaming}
          sx={{
            bgcolor: mode === "dark" ? "#cccccc" : "secondary.main",
            color: mode === "dark" ? "text.primary" : "secondary.contrastText",
            "&:hover": { bgcolor: mode === "dark" ? "#bbbbbb" : "secondary.dark" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "8px",
            minWidth: "48px",
          }}
          aria-label="Stop streaming"
        >
          <StopIcon />
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatWindow;