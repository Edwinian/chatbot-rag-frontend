import axios, { AxiosInstance } from "axios";
import { ApplicationLog, ApplicationLogQueryParams, DeleteFileRequest, DocumentInfo, UploadResponse } from "./types";

// Create a custom Axios instance
const api: AxiosInstance = axios.create({
    baseURL: "http://localhost:8000", // Use environment variable in production
    headers: {
        "Content-Type": "application/json", // Default content type
    },
});

const getPathWithQueryParams = <T>(path: string, queryParams: T): string => {
    if (!queryParams) {
        return path;
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
        if (value) {
            searchParams.append(key, String(value));
        }
    }

    const queryString = searchParams.toString();
    return queryString ? `${path}?${queryString}` : path;
};

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

export const fetchApplicationLogs = async (queryParams: Partial<ApplicationLogQueryParams>): Promise<ApplicationLog[]> => {
    const url = getPathWithQueryParams<Partial<ApplicationLogQueryParams>>('/get-application-logs', queryParams);
    const response = await api.get(url);
    return response.data;
};

export const deleteApplicationLogs = async (queryParams: Partial<ApplicationLogQueryParams>): Promise<ApplicationLog[]> => {
    const url = getPathWithQueryParams<Partial<ApplicationLogQueryParams>>('/delete-application-logs', queryParams);
    const response = await api.post(url);
    return response.data;
};

export const fetchLatestApplicationLogs = async (): Promise<ApplicationLog[]> => {
    const url = '/get-latest-application-logs'
    const response = await api.get(url);
    return response.data;
};
