import { PaletteMode } from "@mui/material";

export enum RoutePath {
    HOME = "/home",
    ABOUT = "/about",
    DOCUMENT = "/document",
}

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
    content: StructuredChunk[];
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
    id: number;
    filename: string;
    upload_timestamp: string;
}

export enum StructuredChunkType {
    HEADING = "heading",
    BULLET = "bullet",
    PARAGRAPH = "paragraph",
}

export interface StructuredChunk {
    type: StructuredChunkType;
    content: string;
}

export interface DeleteFileRequest {
    file_id: number;
}

export interface PageProps {
    mode: PaletteMode;
    setSelectedCollection?: React.Dispatch<React.SetStateAction<string | undefined>>
    selectedCollection?: string;
}

export interface ApplicationLog {
    id: number;
    session_id: string;
    user_query: string;
    model_response: StructuredChunk[];
    model: string;
    created_at: Date;
}

export interface ApplicationLogQueryParams {
    session_id: string
}

export interface UploadResponse { message: string; file_id: string }
