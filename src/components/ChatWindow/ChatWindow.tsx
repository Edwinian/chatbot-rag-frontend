import React, { useState, useEffect, useRef } from "react";
import { ModelName, ChatMessage, WebSocketMessage, WebSocketResponse, WebSocketAction } from "../../types";
import "./ChatWindow.css";

interface ChatWindowProps {
  selectedCollection: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedCollection }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const websocket = new WebSocket(`ws://${process.env.REACT_APP_API_BASE_URL}/ws/chat`);
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
              id: `${data.session_id}-${Date.now()}`,
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
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              id: `${lastMessage.id}-completed`,
            },
          ];
        });
      }
      if (data.error) {
        console.error("WebSocket error:", data.error);
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      setWs(null);
    };

    // return () => {
    //   if (websocket.readyState === WebSocket.OPEN) {
    //     websocket.close();
    //   }
    // };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const message: WebSocketMessage = {
      action: WebSocketAction.OPEN,
      message: input,
      model: ModelName.Mixtral_v0_1, // Adjust as needed
      collection_name: selectedCollection,
      session_id: sessionId,
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
          <div
            key={msg.id}
            className={`message ${msg.isUser ? "user" : "bot"}`}
          >
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