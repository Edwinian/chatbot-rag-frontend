import axios, { AxiosInstance } from "axios";
import { DocumentInfo } from "./types";

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
): Promise<{ message: string; file_id: string }> => {
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