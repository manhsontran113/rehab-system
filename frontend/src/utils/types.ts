// ============= User & Auth Types =============

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

// ============= Exercise Types =============

export interface Exercise {
  id: string;
  name: string;
  description: string;
  target_reps: number;
}

// ============= Pose Detection Types =============

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
}

// ============= Session Types =============

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

export interface SessionSummary {
  session_id: number;
  total_reps: number;
  correct_reps: number;
  accuracy: number;
  duration_seconds: number;
  common_errors: {
    [key: string]: {
      count: number;
      severity: string;
    };
  };
}

// ============= Patient Types =============

export interface Patient extends User {
  last_session?: {
    date: string;
    exercise: string;
    accuracy: number;
  } | null;
}

// ============= Chart Data Types =============

export interface ChartDataPoint {
  date: string;
  accuracy: number;
  reps: number;
}
