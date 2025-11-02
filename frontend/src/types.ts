// ============= POSE & ANALYSIS TYPES =============

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseAngles {
  [key: string]: number;
}

export interface FormError {
  name: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  type: 'analysis';
  pose_detected: boolean;
  landmarks?: Landmark[];
  angles?: PoseAngles;
  rep_count?: number;
  state?: 'ready' | 'lifting' | 'holding' | 'switch_side' | 'complete' | 'down' | 'raising' | 'up' | 'lowering';
  errors?: FormError[];
  feedback?: string;
  hold_time_remaining?: number;
  current_side?: 'left' | 'right';
}

// ============= USER & AUTH TYPES =============

export interface User {
  id: number;
  username: string;
  role: 'patient' | 'doctor';
  full_name: string;
  age?: number;
  gender?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ============= SESSION TYPES =============

export interface ErrorStat {
  name: string;
  count: number;
  severity: string;
}

export interface Session {
  id: number;
  exercise_name: string;
  start_time: string;
  end_time?: string;
  total_reps: number;
  correct_reps: number;
  accuracy: number;
  duration_seconds: number;
  errors?: ErrorStat[];
}

export interface SessionSummary extends Session {
  common_errors?: Record<string, number>;
}

// ============= PATIENT TYPES =============

export interface Patient extends User {
  created_at: string;
  last_session?: {
    date: string;
    exercise: string;
    accuracy: number;
  } | null;
}

// ============= EXERCISE TYPES =============

export interface Exercise {
  id: string;
  name: string;
  description: string;
  target_reps: number;
}
