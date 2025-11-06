import axios from 'axios';
import type { LoginResponse, Exercise, Session, Patient, ErrorAnalyticsResponse } from './types';

const API_URL = 'http://localhost:8000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============= AUTH APIs =============

export const authAPI = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    return response.data;
  },

  async register(data: {
    username: string;
    password: string;
    full_name: string;
    age?: number;
    gender?: string;
    role?: string;
  }): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },
};

// ============= EXERCISE APIs =============

export const exerciseAPI = {
  async getExercises(): Promise<{ exercises: Exercise[] }> {
    const response = await api.get('/exercises');
    return response.data;
  },
};

// ============= SESSION APIs =============

export const sessionAPI = {
  async startSession(exerciseName: string): Promise<{ session_id: number }> {
    const response = await api.post('/sessions/start', null, {
      params: { exercise_name: exerciseName },
    });
    return response.data;
  },

  async endSession(sessionId: number): Promise<Session> {
    const response = await api.post(`/sessions/${sessionId}/end`);
    return response.data;
  },

  async getMyHistory(limit: number = 20): Promise<{ sessions: Session[] }> {
    const response = await api.get('/sessions/my-history', {
      params: { limit },
    });
    return response.data;
  },

  async getErrorAnalytics(): Promise<ErrorAnalyticsResponse> {
    const response = await api.get('/sessions/error-analytics');
    return response.data;
  },
};

// ============= DOCTOR APIs =============

export const doctorAPI = {
  async getPatients(): Promise<{ patients: Patient[] }> {
    const response = await api.get('/doctor/patients');
    return response.data;
  },

  async getPatientHistory(
    patientId: number,
    limit: number = 20
  ): Promise<{ sessions: Session[] }> {
    const response = await api.get(`/doctor/patient/${patientId}/history`, {
      params: { limit },
    });
    return response.data;
  },

  async getPatientErrorAnalytics(patientId: number): Promise<ErrorAnalyticsResponse> {
    const response = await api.get(`/doctor/patient/${patientId}/error-analytics`);
    return response.data;
  },
};

// Export default api instance for custom calls
export default api;
