// Types for V3

export interface User {
  id: number;
  username: string;
  role: 'patient' | 'doctor';
  full_name: string;
  age?: number;
  gender?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
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

export interface ErrorStat {
  name: string;
  count: number;
  severity: string;
}

export interface Patient extends User {
  last_session?: {
    date: string;
    exercise: string;
    accuracy: number;
  };
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  target_reps: number;
}

// Pose tracking types (from V2)
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
  errors?: FormError[];
  feedback?: string;
  state?: string;
  hold_time_remaining?: number;
  current_side?: 'left' | 'right';
}
