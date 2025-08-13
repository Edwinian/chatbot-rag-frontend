import { PaletteMode } from "@mui/material";

export enum ModelName {
    Mixtral_v0_1 = "mixtral_v0_1",
    // Add other models as needed
}

export enum WebSocketAction {
    CHAT = "chat",
    STOP = "stop",
    CLOSE = "close",
    OPEN = "open",
}

export interface ChatMessage {
    id: string;
    content: (string | StructuredChunk)[];
    isUser: boolean;
    timestamp: string;
}

export interface WebSocketMessage {
    action?: WebSocketAction;
    message?: string;
    model?: ModelName;
    collection_name?: string | null;
    session_id?: string;
}

export interface WebSocketResponse {
    status: string;
    chunk: StructuredChunk;
    session_id: string;
    error?: string;
}

export interface DocumentInfo {
    file_id: string;
    file_name: string;
}

export interface StructuredChunk {
    type: "heading" | "bullet" | "paragraph";
    content: string;
    is_bold: boolean;
}

export interface ChatWindowProps {
    selectedCollection: string | null;
    mode: PaletteMode;
}