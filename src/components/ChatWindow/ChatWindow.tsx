import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Paper,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  WebSocketMessage,
  WebSocketResponse,
  WebSocketAction,
  ChatMessage,
  StructuredChunk,
  StructuredChunkType,
  PageProps,
  ApplicationLog,
} from "../../types";
import { fetchApplicationLogs } from "../../api";
import MessageScreen from "./MessageScreen";
import MessageBar from "./MessageBar";
import NewChatButton from "./NewChatButton";

const ChatWindow: React.FC<PageProps> = ({ selectedCollection, mode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Get sessionId from URL query or generate a new one
  const sessionId = searchParams.get("sessionId");

  const startNewSession = () => {
    const sessionId = uuidv4();
    setSearchParams({ sessionId });
    setMessages([]); // Clear messages
    setInput(""); // Clear input field
  };

  // Fetch chat history for sessionId
  const fetchSessionMessages = useCallback(async () => {
    if (!sessionId) return;

    try {
      const logs = await fetchApplicationLogs(sessionId);

      // If backend has cleared logs on error, start a new session
      if (!logs.length) {
        startNewSession();
      }

      const chatMessages: ChatMessage[] = logs.flatMap((log: ApplicationLog) => [
        {
          id: `${log.id}-user`,
          content: [{ type: StructuredChunkType.PARAGRAPH, content: log.user_query }],
          isUser: true,
          timestamp: new Date(log.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          id: `${log.id}-system`,
          content: log.model_response,
          isUser: false,
          timestamp: new Date(log.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setMessages((prev) => [
        ...(prev.length === 0 && logs.length === 0
          ? [
            {
              id: `${Date.now()}`,
              content: [{ type: StructuredChunkType.PARAGRAPH, content: "Welcome to the chat! How can I assist you today?" }],
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]
          : []),
        ...chatMessages,
      ]);
    } catch (error) {
      console.error("Error fetching session messages:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          content: [{ type: StructuredChunkType.PARAGRAPH, content: "Failed to load chat history. Please try again." }],
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [sessionId]);


  const initializeWebSocket = useCallback((): WebSocket | null => {
    if (!process.env.REACT_APP_API_BASE_URL) {
      console.error("WebSocket error: REACT_APP_API_BASE_URL is undefined or empty");
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          content: [{ type: StructuredChunkType.PARAGRAPH, content: "Failed to connect to WebSocket. Please check server configuration." }],
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
          if (data.session_id && !sessionId) {
            setSearchParams({ sessionId: data.session_id });
          }
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
                  id: `${data.session_id || sessionId || "unknown"}-${Date.now()}`,
                  content: [chunk],
                  isUser: false,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
                content: [{ type: StructuredChunkType.PARAGRAPH, content: "Failed to fetch data. Please try again." }],
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }
        } catch (error) {
          console.error("WebSocket message parsing error:", error);
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}`,
              content: [{ type: StructuredChunkType.PARAGRAPH, content: "Error processing server response." }],
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
  }, [sessionId, setSearchParams]);

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
            content: [{ type: StructuredChunkType.PARAGRAPH, content: input }],
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
            content: [{ type: StructuredChunkType.PARAGRAPH, content: "Failed to send message. WebSocket not connected." }],
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

  const stopStreaming = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: WebSocketAction.STOP, session_id: sessionId }));
      setIsLoading(false);
    }
  };

  // Initialize sessionId 
  useEffect(() => {
    if (!sessionId) {
      startNewSession();
    }
  }, [sessionId, setSearchParams]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (ws) return;
    const websocket = initializeWebSocket();
    if (websocket) setWs(websocket);
  }, [ws, initializeWebSocket]);

  // Fetch messages on first render if sessionId exists
  useEffect(() => {
    if (sessionId && messages.length === 0) {
      fetchSessionMessages();
    }
  }, [sessionId, fetchSessionMessages, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <NewChatButton startNewSession={startNewSession} mode={mode} />
      <MessageScreen messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
      <MessageBar stopStreaming={stopStreaming} sendMessage={sendMessage} setInput={setInput} input={input} mode={mode} />
    </Paper>
  );
};

export default ChatWindow;