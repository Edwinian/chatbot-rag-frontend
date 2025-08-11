export enum ModelName {
    Mixtral_v0_1 = "mixtral_v0_1",
    // Add other models as needed
}

export enum WebSocketAction {
    STOP = "stop",
    CLOSE = "close",
    OPEN = "open",
}

export interface ChatMessage {
    id: string;
    content: string;
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
    chunk?: string;
    session_id?: string;
    is_last_chunk?: boolean;
    error?: string;
}

export interface DocumentInfo {
    file_id: string;
    file_name: string;
}