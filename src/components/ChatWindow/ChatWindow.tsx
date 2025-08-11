import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, WebSocketMessage, WebSocketResponse, WebSocketAction } from "../../types";
import "./ChatWindow.css";

interface ChatWindowProps {
  selectedCollection: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedCollection }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket>();
  const [sessionId, setSessionId] = useState<string>(); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!process.env.REACT_APP_API_BASE_URL || !!ws) {
      return
    }

    // Ensure WebSocket URL uses ws:// and handles http:// prefix
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^http(s)?:\/\//, "");
    const websocket = new WebSocket(`ws://${baseUrl}/ws/chat`);
    setWs(websocket);

    websocket.onopen = () => {
      console.log("WebSocket connected");
    };

    websocket.onmessage = (event) => {
      const data: WebSocketResponse = JSON.parse(event.data);
      if (data.session_id) {
        setSessionId(data.session_id);
      }
      if (data.chunk) {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.isUser === false && !lastMessage?.id.includes("completed")) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content + data.chunk,
              },
            ];
          }
          return [
            ...prev,
            {
              id: `${data.session_id || "unknown"}-${Date.now()}`,
              content: data.chunk || '',
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
              {
                ...lastMessage,
                id: `${lastMessage.id}-completed`,
              },
            ];
          }
          return prev;
        });
      }
      if (data.error) {
        console.error("WebSocket error:", data.error);
      }
    };

    websocket.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ action: WebSocketAction.CLOSE, session_id: sessionId }));
        websocket.close();
      }
    };
  }, [sessionId]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const message: WebSocketMessage = {
      action: WebSocketAction.CHAT, // Use CHAT for sending messages
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
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const stopStreaming = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: WebSocketAction.STOP, session_id: sessionId }));
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isUser ? "user" : "bot"}`}>
            <div className="message-content">{msg.content}</div>
            <div className="timestamp">{msg.timestamp}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={stopStreaming}>Stop</button>
      </div>
    </div>
  );
};

export default ChatWindow;