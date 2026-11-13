// File: src/Store/aiApi.ts
import { TokenStorage } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface AnalyzeRequestPayload {
  question: string;
  goal: string;
  signalValues: number[];
  plannerMode: 'DETERMINISTIC' | 'SUPERVISOR';
}

export const aiApi = {
  // 1. Chat với AI Agent & Business Rule Engine (POST /api/research-agent/chat)
  chat: async (payload: {
    message: string;
    userRole: 'STAFF' | 'CUSTOMER';
    history?: Array<{ sender: string; text: string }>;
    contextData?: Record<string, any>;
    signalValues?: number[];
    plannerMode?: 'DETERMINISTIC' | 'SUPERVISOR';
  }): Promise<{ reply: string; report?: any; source?: string }> => {
    const token = TokenStorage.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/api/research-agent/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`AI Server Error (${res.status})`);
    }
    return res.json();
  },

  // 2. Chạy phân tích CNN + Embabel GOAP/Supervisor trực tiếp (POST /api/research-agent/analyze)
  analyze: async (payload: AnalyzeRequestPayload): Promise<any> => {
    const token = TokenStorage.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/api/research-agent/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Analyze API Error (${res.status})`);
    }
    return res.json();
  },

  // 3. Upload tài liệu quy tắc bảo hiểm vào ToolishRag (POST /api/research-agent/ingest)
  ingestDocument: async (file: File): Promise<{
    fileName: string;
    ingestedChunks: number;
    totalIndexedChunks: number;
  }> => {
    const token = TokenStorage.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/research-agent/ingest`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Ingest Document Error (${res.status})`);
    }
    return res.json();
  },
};