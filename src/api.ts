import axios, { AxiosInstance } from "axios";
import { ApplicationLog, DeleteFileRequest, DocumentInfo, UploadResponse } from "./types";

// Create a custom Axios instance
const api: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default content type
    },
});

// API functions
export const uploadDocument = async (
    file: File,
    collectionName: string | null
): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/upload-doc`, formData, {
        headers: { "Content-Type": "multipart/form-data" }, // Override for file upload
    });
    return response.data;
};

export const fetchCollections = async (): Promise<string[]> => {
    const response = await api.get("/list-collections");
    return response.data;
};

export const fetchDocuments = async (): Promise<DocumentInfo[]> => {
    const response = await api.get("/list-docs");
    return response.data;
};

export const deleteDocument = async (request: DeleteFileRequest): Promise<{ message?: string, error?: string }> => {
    const response = await api.post('/delete-doc', request);
    return response.data;
}

export const fetchApplicationLogs = async (sessionId: string): Promise<ApplicationLog[]> => {
    const response = await api.get(`/get-application-logs?session_id=${sessionId}`);
    return response.data;
};