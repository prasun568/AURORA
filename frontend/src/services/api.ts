import axios from 'axios';
import { ReviewResult, User } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to all requests if present in localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await client.post('/api/auth/login', { email, password });
    return res.data;
  },

  register: async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await client.post('/api/auth/register', { name, email, password });
    return res.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const res = await client.post('/api/auth/logout');
    return res.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await client.get('/api/auth/me');
    return res.data;
  },

  startReview: async (payload: {
    topic: string;
    review_type?: string;
    citation_style?: string;
    template?: string;
    writing_style?: string;
    date_start?: string | number;
    date_end?: string | number;
    max_papers?: number;
  }): Promise<{ task_id: string; status: string }> => {
    const res = await client.post('/api/review/start', payload);
    return res.data;
  },

  getStatus: async (taskId: string): Promise<{ status: string; progress?: number }> => {
    const res = await client.get(`/api/review/status/${taskId}`);
    return res.data;
  },

  getResult: async (taskId: string): Promise<ReviewResult> => {
    const res = await client.get(`/api/review/result/${taskId}`);
    return res.data;
  },

  submitFeedback: async (taskId: string, rating: number, comment?: string): Promise<{ success: boolean }> => {
    const res = await client.post(`/api/review/feedback/${taskId}`, { rating, comment });
    return res.data;
  },

  getTemplates: async (): Promise<string[]> => {
    const res = await client.get('/api/templates/list');
    return res.data;
  },

  getCitationStyles: async (): Promise<string[]> => {
    const res = await client.get('/api/citation-styles/list');
    return res.data;
  },

  exportDocx: async (taskId: string): Promise<Blob> => {
    const res = await client.get(`/api/export/docx/${taskId}`, { responseType: 'blob' });
    return res.data;
  },

  exportPdf: async (taskId: string): Promise<Blob> => {
    const res = await client.get(`/api/export/pdf/${taskId}`, { responseType: 'blob' });
    return res.data;
  },

  exportLatex: async (taskId: string): Promise<string> => {
    const res = await client.get(`/api/export/latex/${taskId}`, { responseType: 'text' });
    return res.data;
  },

  exportBibtex: async (taskId: string): Promise<string> => {
    const res = await client.get(`/api/export/bibtex/${taskId}`, { responseType: 'text' });
    return res.data;
  },
};
