"""
AI Rehabilitation System V3 - Complete Backend
With Authentication, Database, Session Management
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import cv2
import mediapipe as mp
import numpy as np
import base64
import json
import time
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import jwt
import hashlib
from pathlib import Path
from enum import Enum
from collections import deque
import time

# Config
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
DB_PATH = Path("rehab_v3.db")

app = FastAPI(title="Rehab System V3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# MediaPipe
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    model_complexity=1
)


# ============= DATABASE =============
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    """Initialize database with complete schema"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('patient', 'doctor')),
            full_name TEXT,
            age INTEGER,
            gender TEXT,
            created_at TEXT NOT NULL,
            doctor_id INTEGER,
            FOREIGN KEY (doctor_id) REFERENCES users(id)
        )
    """)
    
    # Sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            exercise_name TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT,
            total_reps INTEGER DEFAULT 0,
            correct_reps INTEGER DEFAULT 0,
            accuracy REAL DEFAULT 0,
            duration_seconds INTEGER DEFAULT 0,
            avg_heart_rate INTEGER,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES users(id)
        )
    """)
    
    # Session frames table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS session_frames (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            rep_count INTEGER,
            angles TEXT,
            errors TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    """)
    
    # Errors table (aggregated)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS session_errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            error_name TEXT NOT NULL,
            count INTEGER DEFAULT 0,
            severity TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    """)
    
    conn.commit()
    
    # Create default users if not exist
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        # Default doctor
        cursor.execute("""
            INSERT INTO users (username, password_hash, role, full_name, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, ('doctor1', hash_password('doctor123'), 'doctor', 'BS. Nguyễn Văn A', datetime.now().isoformat()))
        
        doctor_id = cursor.lastrowid
        
        # Default patients
        patients = [
            ('patient1', 'patient123', 'Trần Thị B', 65, 'Nữ'),
            ('patient2', 'patient123', 'Lê Văn C', 70, 'Nam'),
        ]
        
        for username, password, name, age, gender in patients:
            cursor.execute("""
                INSERT INTO users (username, password_hash, role, full_name, age, gender, created_at, doctor_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (username, hash_password(password), 'patient', name, age, gender, datetime.now().isoformat(), doctor_id))
        
        conn.commit()
    
    conn.close()

init_db()


# ============= AUTH MODELS =============

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    role: str = 'patient'
    doctor_id: Optional[int] = None


# ============= AUTH FUNCTIONS =============



def create_token(user_id: int, username: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(token_data = Depends(verify_token)):
    return token_data


# ============= POSE LOGIC (from V2) =============

class AngleCalculator:
    @staticmethod
    def calculate_angle(point1, point2, point3):
        a = np.array([point1.x, point1.y])
        b = np.array([point2.x, point2.y])
        c = np.array([point3.x, point3.y])
        
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        
        return np.degrees(angle)
    
    @staticmethod
    def get_angles(landmarks, exercise_type):
        if exercise_type == "squat":
            return {
                'left_knee': AngleCalculator.calculate_angle(
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP],
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE],
                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE]
                ),
                'right_knee': AngleCalculator.calculate_angle(
                    landmarks[mp_pose.PoseLandmark.RIGHT_HIP],
                    landmarks[mp_pose.PoseLandmark.RIGHT_KNEE],
                    landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE]
                ),
            }
        elif exercise_type == "arm_raise":
            return {
                'left_shoulder': AngleCalculator.calculate_angle(
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP],
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER],
                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW]
                ),
                'right_shoulder': AngleCalculator.calculate_angle(
                    landmarks[mp_pose.PoseLandmark.RIGHT_HIP],
                    landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER],
                    landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW]
                ),
                'left_elbow': AngleCalculator.calculate_angle(
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER],
                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW],
                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
                ),
                'right_elbow': AngleCalculator.calculate_angle(
                    landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER],
                    landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW],
                    landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
                ),
            }
        # ✅ THÊM MỚI: single_leg_stand
        elif exercise_type == "single_leg_stand":
            # Calculate leg angles
            left_leg_angle = AngleCalculator.calculate_angle(
                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER],
                landmarks[mp_pose.PoseLandmark.LEFT_HIP],
                landmarks[mp_pose.PoseLandmark.LEFT_KNEE]
            )
            right_leg_angle = AngleCalculator.calculate_angle(
                landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER],
                landmarks[mp_pose.PoseLandmark.RIGHT_HIP],
                landmarks[mp_pose.PoseLandmark.RIGHT_KNEE]
            )
            
            # Calculate knee angles
            left_knee_angle = AngleCalculator.calculate_angle(
                landmarks[mp_pose.PoseLandmark.LEFT_HIP],
                landmarks[mp_pose.PoseLandmark.LEFT_KNEE],
                landmarks[mp_pose.PoseLandmark.LEFT_ANKLE]
            )
            right_knee_angle = AngleCalculator.calculate_angle(
                landmarks[mp_pose.PoseLandmark.RIGHT_HIP],
                landmarks[mp_pose.PoseLandmark.RIGHT_KNEE],
                landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE]
            )

            # Calculate foot positions relative to opposite knee
            left_foot_to_right_knee = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y - landmarks[mp_pose.PoseLandmark.RIGHT_KNEE].y
            right_foot_to_left_knee = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE].y - landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y
            
            angles = {
                'left_leg': left_leg_angle,
                'right_leg': right_leg_angle,
                'left_knee': left_knee_angle,
                'right_knee': right_knee_angle,
                'left_foot_height': left_foot_to_right_knee,
                'right_foot_height': right_foot_to_left_knee,
                # Keep Y positions for backward compatibility
                'left_knee_y': landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y,
                'right_knee_y': landmarks[mp_pose.PoseLandmark.RIGHT_KNEE].y,
                'left_hip_y': landmarks[mp_pose.PoseLandmark.LEFT_HIP].y,
                'right_hip_y': landmarks[mp_pose.PoseLandmark.RIGHT_HIP].y,
            }
            
            # Debug information
            print(f"Knee angles - Left: {angles['left_knee']:.1f}°, Right: {angles['right_knee']:.1f}°")
            print(f"Knee heights - Left: {angles['left_knee_y']:.3f}, Right: {angles['right_knee_y']:.3f}")
            
            return angles
        return {}


class ExerciseState(Enum):
    DOWN = "down"
    RAISING = "raising"
    UP = "up"
    LOWERING = "lowering"
    # ✅ THÊM MỚI cho single_leg_stand
    READY = "ready"
    LIFTING = "lifting"
    HOLDING = "holding"
    SWITCH_SIDE = "switch_side"
    COMPLETE = "complete"

class RepetitionCounter:
    def __init__(self, exercise_type):
        self.exercise_type = exercise_type
        self.rep_count = 0
        self.state = ExerciseState.DOWN if exercise_type != "single_leg_stand" else ExerciseState.READY
        self.last_state_change = time.time()
        
        # For single_leg_stand
        self.current_side = "left"  # Start with left leg
        self.hold_start_time = None
        self.hold_duration = 10.0  # 10 seconds
        self.left_completed = False
        self.right_completed = False
        
        # Thresholds
        if exercise_type == "arm_raise":
            self.down_threshold = 90
            self.up_threshold = 160
            self.hysteresis = 5
        elif exercise_type == "squat":
            self.down_threshold = 160
            self.up_threshold = 90
            self.hysteresis = 5
        elif exercise_type == "single_leg_stand":
            self.knee_threshold = 90  # Góc gập gối
            self.knee_height_threshold = 0.1  # Chân phải nâng cao hơn 0.1 (tỉ lệ)
            self.hysteresis = 5
    
    def update(self, angles):
        """Update state machine and return current rep count"""
        if self.exercise_type == "arm_raise":
            return self._count_arm_raise(angles)
        elif self.exercise_type == "squat":
            return self._count_squat(angles)
        elif self.exercise_type == "single_leg_stand":
            return self._count_single_leg(angles)
        return self.rep_count
    
    def _count_single_leg(self, angles):
        """State machine for single leg stand"""
        current_time = time.time()
        
        # Get knee angle from angles dict based on current side
        knee_angle = angles.get('left_knee' if self.current_side == 'left' else 'right_knee', 180)
        
        # Get knee and hip y-coordinates for height comparison
        if self.current_side == "left":
            knee_y = angles.get('left_knee_y', 0.5)
            hip_y = angles.get('left_hip_y', 0.5)
        else:
            knee_y = angles.get('right_knee_y', 0.5)
            hip_y = angles.get('right_hip_y', 0.5)
            
        # Check if knee is lifted
        height_diff = hip_y - knee_y  # Positive value means knee is higher than hip
        is_knee_lifted = (height_diff > self.knee_height_threshold) and (knee_angle < self.knee_threshold)
        
        # Debug information
        print(f"Current side: {self.current_side}")
        print(f"Height difference: {height_diff:.3f}")
        print(f"Knee angle: {knee_angle:.1f}°")
        print(f"Is knee lifted: {is_knee_lifted}")
        
        # State machine
        if self.state == ExerciseState.READY:
            # Waiting to start
            if is_knee_lifted:
                self.state = ExerciseState.LIFTING
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.LIFTING:
            # Leg is being lifted
            if knee_angle <= self.knee_threshold and is_knee_lifted:
                # Knee lifted high enough
                self.state = ExerciseState.HOLDING
                self.hold_start_time = current_time
                self.last_state_change = current_time
            elif not is_knee_lifted:
                # Put leg back down
                self.state = ExerciseState.READY
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.HOLDING:
            # Holding the position
            if self.hold_start_time:
                elapsed = current_time - self.hold_start_time
                
                if not is_knee_lifted or knee_angle > self.knee_threshold + 15:
                    # Lost position
                    self.state = ExerciseState.LOWERING
                    self.hold_start_time = None
                    self.last_state_change = current_time
                elif elapsed >= self.hold_duration:
                    # Held for 10 seconds!
                    self.state = ExerciseState.LOWERING
                    self.hold_start_time = None
                    self.last_state_change = current_time
                    
                    # Mark side as completed
                    if self.current_side == "left":
                        self.left_completed = True
                    else:
                        self.right_completed = True
                        
        elif self.state == ExerciseState.LOWERING:
            # Lowering the leg
            if not is_knee_lifted and knee_angle > 160:
                # Leg is down
                if self.left_completed and self.right_completed:
                    # Both sides done - complete!
                    self.state = ExerciseState.COMPLETE
                    self.rep_count += 1
                    self.left_completed = False
                    self.right_completed = False
                    self.last_state_change = current_time
                else:
                    # Switch to other side
                    self.state = ExerciseState.SWITCH_SIDE
                    self.current_side = "right" if self.current_side == "left" else "left"
                    self.last_state_change = current_time
                    
        elif self.state == ExerciseState.SWITCH_SIDE:
            # Wait a moment, then ready for other side
            if current_time - self.last_state_change > 2.0:  # 2 second pause
                self.state = ExerciseState.READY
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.COMPLETE:
            # Wait a moment, then ready for next rep
            if current_time - self.last_state_change > 3.0:  # 3 second pause
                self.state = ExerciseState.READY
                self.current_side = "left"
                self.last_state_change = current_time
        
        return self.rep_count
    
    def _count_arm_raise(self, angles):
        # ... existing code ...
        left_shoulder = angles.get('left_shoulder', 0)
        right_shoulder = angles.get('right_shoulder', 0)
        shoulder_angle = max(left_shoulder, right_shoulder)
        
        current_time = time.time()
        
        if self.state == ExerciseState.DOWN:
            if shoulder_angle > self.down_threshold + self.hysteresis:
                self.state = ExerciseState.RAISING
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.RAISING:
            if shoulder_angle >= self.up_threshold:
                self.state = ExerciseState.UP
                self.last_state_change = current_time
            elif shoulder_angle < self.down_threshold:
                self.state = ExerciseState.DOWN
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.UP:
            if shoulder_angle < self.up_threshold - self.hysteresis:
                self.state = ExerciseState.LOWERING
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.LOWERING:
            if shoulder_angle < self.down_threshold:
                self.state = ExerciseState.DOWN
                self.rep_count += 1
                self.last_state_change = current_time
            elif shoulder_angle > self.up_threshold:
                self.state = ExerciseState.UP
                self.last_state_change = current_time
        
        return self.rep_count
    
    def _count_squat(self, angles):
        # ... existing code ...
        left_knee = angles.get('left_knee', 180)
        right_knee = angles.get('right_knee', 180)
        knee_angle = min(left_knee, right_knee)
        
        current_time = time.time()
        
        if self.state == ExerciseState.DOWN:
            if knee_angle < self.down_threshold - self.hysteresis:
                self.state = ExerciseState.LOWERING
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.LOWERING:
            if knee_angle <= self.up_threshold:
                self.state = ExerciseState.UP
                self.last_state_change = current_time
            elif knee_angle > self.down_threshold:
                self.state = ExerciseState.DOWN
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.UP:
            if knee_angle > self.up_threshold + self.hysteresis:
                self.state = ExerciseState.RAISING
                self.last_state_change = current_time
                
        elif self.state == ExerciseState.RAISING:
            if knee_angle >= self.down_threshold:
                self.state = ExerciseState.DOWN
                self.rep_count += 1
                self.last_state_change = current_time
            elif knee_angle < self.up_threshold:
                self.state = ExerciseState.UP
                self.last_state_change = current_time
        
        return self.rep_count
    
    def get_hold_time_remaining(self):
        """Get remaining hold time for single_leg_stand"""
        if self.exercise_type != "single_leg_stand":
            return None
        if self.state != ExerciseState.HOLDING or not self.hold_start_time:
            return None
        
        elapsed = time.time() - self.hold_start_time
        remaining = max(0, self.hold_duration - elapsed)
        return remaining
    
    def get_current_side(self):
        """Get current side for single_leg_stand"""
        if self.exercise_type != "single_leg_stand":
            return None
        return self.current_side
    
    def reset(self):
        self.rep_count = 0
        self.state = ExerciseState.DOWN if self.exercise_type != "single_leg_stand" else ExerciseState.READY
        self.last_state_change = time.time()
        self.hold_start_time = None
        self.left_completed = False
        self.right_completed = False
        self.current_side = "left"
    
    def get_state(self):
        return self.state



class ErrorDetector:
    def __init__(self, exercise_type):
        self.exercise_type = exercise_type
        # Debounce tracking: {error_name: first_detection_time}
        self.error_timers = {}
        self.debounce_duration = 1.0  # 1 giây
        
    def detect_errors(self, landmarks, angles, state: ExerciseState):
        current_time = time.time()
        errors = []
        detected_errors = set()  # Track errors in this frame
        
        if self.exercise_type == "arm_raise":
            errors.extend(self._check_arm_raise_errors(landmarks, angles, state, current_time, detected_errors))
        elif self.exercise_type == "squat":
            errors.extend(self._check_squat_errors(landmarks, angles, state, current_time, detected_errors))
        elif self.exercise_type == "single_leg_stand":
            errors.extend(self._check_single_leg_errors(landmarks, angles, state, current_time, detected_errors))
        
        # Clean up expired timers
        self._cleanup_timers(detected_errors, current_time)
        
        return errors
    
    def _check_single_leg_errors(self, landmarks, angles, state, current_time, detected_errors):
        errors = []
        
        # Only check errors during HOLDING state
        if state != ExerciseState.HOLDING:
            return errors
        
        # Get current side from RepetitionCounter (we'll pass it separately)
        left_knee = angles.get('left_knee', 180)
        right_knee = angles.get('right_knee', 180)
        left_knee_y = angles.get('left_knee_y', 0.5)
        right_knee_y = angles.get('right_knee_y', 0.5)
        left_hip_y = angles.get('left_hip_y', 0.5)
        right_hip_y = angles.get('right_hip_y', 0.5)
        
        # Check which knee should be lifted (the one with smaller angle)
        if left_knee < right_knee:
            # Left leg is lifted
            knee_angle = left_knee
            knee_y = left_knee_y
            hip_y = left_hip_y
        else:
            # Right leg is lifted
            knee_angle = right_knee
            knee_y = right_knee_y
            hip_y = right_hip_y
        
        # Error 1: Knee not high enough
        if knee_y >= hip_y - 0.05:  # Knee should be at least 5% higher than hip
            error_name = 'knee_not_high'
            detected_errors.add(error_name)
            if self._should_report_error(error_name, current_time):
                errors.append({
                    'name': 'Chân chưa đủ cao',
                    'message': '❌ Nâng đầu gối cao hơn!',
                    'severity': 'high'
                })
        
        # Error 2: Knee angle too large (not bent enough)
        if knee_angle > 100:
            error_name = 'knee_not_bent'
            detected_errors.add(error_name)
            if self._should_report_error(error_name, current_time):
                errors.append({
                    'name': 'Chân chưa co đủ',
                    'message': '⚠️ Co gối lại nhiều hơn!',
                    'severity': 'medium'
                })
        
        return errors

    def _check_arm_raise_errors(self, landmarks, angles, state, current_time, detected_errors):
        errors = []
        
        left_shoulder = angles.get('left_shoulder', 0)
        right_shoulder = angles.get('right_shoulder', 0)
        left_elbow = angles.get('left_elbow', 180)
        right_elbow = angles.get('right_elbow', 180)
        
        shoulder_angle = max(left_shoulder, right_shoulder)
        elbow_angle = min(left_elbow, right_elbow)
        
        # ✅ CHỈ CHECK LỖI Ở STATE UP (đã nâng xong)
        if state == ExerciseState.UP:
            # Error 1: Góc vai không đủ
            if shoulder_angle < 160:
                error_name = 'shoulder_angle_low'
                detected_errors.add(error_name)
                if self._should_report_error(error_name, current_time):
                    errors.append({
                        'name': 'Góc vai chưa đủ',
                        'message': '❌ Nâng tay cao hơn nữa!',
                        'severity': 'high'
                    })
            
            # Error 2: Tay không thẳng
            if elbow_angle < 160:
                error_name = 'elbow_bent'
                detected_errors.add(error_name)
                if self._should_report_error(error_name, current_time):
                    errors.append({
                        'name': 'Tay không thẳng',
                        'message': '⚠️ Duỗi thẳng tay!',
                        'severity': 'medium'
                    })
        
        # ✅ CHECK Ở STATE DOWN (đã hạ xong)
        elif state == ExerciseState.DOWN:
            # Error 3: Chưa hạ hết tay
            if shoulder_angle > 90:
                error_name = 'arms_not_down'
                detected_errors.add(error_name)
                if self._should_report_error(error_name, current_time):
                    errors.append({
                        'name': 'Chưa hạ hết',
                        'message': '⚠️ Hạ tay xuống hẳn!',
                        'severity': 'medium'
                    })
        
        # ✅ Ở state RAISING/LOWERING: KHÔNG BÁO LỖI!
        # → User đang chuyển động, bình thường!
        
        return errors
    
    def _check_squat_errors(self, landmarks, angles, state, current_time, detected_errors):
        errors = []
        
        left_knee = angles.get('left_knee', 180)
        right_knee = angles.get('right_knee', 180)
        knee_angle = min(left_knee, right_knee)
        
        # Check ở state UP (gập gối xong)
        if state == ExerciseState.UP:
            if knee_angle > 90:
                error_name = 'knee_angle_high'
                detected_errors.add(error_name)
                if self._should_report_error(error_name, current_time):
                    errors.append({
                        'name': 'Gập gối chưa đủ',
                        'message': '❌ Gập gối sâu hơn!',
                        'severity': 'high'
                    })
        
        elif state == ExerciseState.DOWN:
            if knee_angle < 160:
                error_name = 'not_standing_straight'
                detected_errors.add(error_name)
                if self._should_report_error(error_name, current_time):
                    errors.append({
                        'name': 'Chưa đứng thẳng',
                        'message': '⚠️ Đứng thẳng hẳn!',
                        'severity': 'medium'
                    })
        
        return errors
    
    def _should_report_error(self, error_name, current_time):
        """
        Chỉ report error nếu đã persist >= 1 giây
        """
        if error_name not in self.error_timers:
            # First time detecting this error
            self.error_timers[error_name] = current_time
            return False  # Chưa đủ 1s, không report
        
        # Check nếu đã đủ 1 giây
        elapsed = current_time - self.error_timers[error_name]
        return elapsed >= self.debounce_duration
    
    def _cleanup_timers(self, detected_errors, current_time):
        """
        Xóa timers cho errors không còn xuất hiện
        """
        errors_to_remove = []
        for error_name in self.error_timers:
            if error_name not in detected_errors:
                errors_to_remove.append(error_name)
        
        for error_name in errors_to_remove:
            del self.error_timers[error_name]


# ============= SESSION MANAGER =============

class SessionManager:
    def __init__(self):
        self.current_session = None
        self.frame_data = []
    
    def start_session(self, patient_id: int, exercise_name: str):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO sessions (patient_id, exercise_name, start_time)
            VALUES (?, ?, ?)
        """, (patient_id, exercise_name, datetime.now().isoformat()))
        
        session_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        self.current_session = {
            'id': session_id,
            'patient_id': patient_id,
            'exercise_name': exercise_name
        }
        self.frame_data = []
        
        return session_id
    
    def log_frame(self, rep_count: int, angles: dict, errors: list):
        if not self.current_session:
            return
        
        self.frame_data.append({
            'timestamp': datetime.now().isoformat(),
            'rep_count': rep_count,
            'angles': angles,
            'errors': errors
        })
    
    def end_session(self):
        if not self.current_session:
            return None
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get session start time
        cursor.execute("SELECT start_time FROM sessions WHERE id = ?", (self.current_session['id'],))
        start_time_str = cursor.fetchone()[0]
        start_time = datetime.fromisoformat(start_time_str)
        
        end_time = datetime.now()
        duration = (end_time - start_time).seconds
        
        # Calculate stats
        total_reps = max([f['rep_count'] for f in self.frame_data], default=0)
        frames_without_errors = sum(1 for f in self.frame_data if not f['errors'])
        accuracy = (frames_without_errors / len(self.frame_data) * 100) if self.frame_data else 0
        correct_reps = int(total_reps * accuracy / 100)
        
        # Update session
        cursor.execute("""
            UPDATE sessions
            SET end_time = ?, total_reps = ?, correct_reps = ?, accuracy = ?, duration_seconds = ?
            WHERE id = ?
        """, (end_time.isoformat(), total_reps, correct_reps, accuracy, duration, self.current_session['id']))
        
        # Save error stats
        error_counts = {}
        for frame in self.frame_data:
            for error in frame['errors']:
                key = error['name']
                if key not in error_counts:
                    error_counts[key] = {'count': 0, 'severity': error['severity']}
                error_counts[key]['count'] += 1
        
        for error_name, info in error_counts.items():
            cursor.execute("""
                INSERT INTO session_errors (session_id, error_name, count, severity)
                VALUES (?, ?, ?, ?)
            """, (self.current_session['id'], error_name, info['count'], info['severity']))
        
        conn.commit()
        conn.close()
        
        result = {
            'session_id': self.current_session['id'],
            'total_reps': total_reps,
            'correct_reps': correct_reps,
            'accuracy': round(accuracy, 2),
            'duration_seconds': duration,
            'common_errors': error_counts
        }
        
        self.current_session = None
        self.frame_data = []
        
        return result


session_manager = SessionManager()


# ============= API ROUTES =============

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, username, role, full_name, age, gender, doctor_id
        FROM users WHERE username = ? AND password_hash = ?
    """, (request.username, hash_password(request.password)))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id, username, role, full_name, age, gender, doctor_id = user
    
    token = create_token(user_id, username, role)
    
    return {
        'token': token,
        'user': {
            'id': user_id,
            'username': username,
            'role': role,
            'full_name': full_name,
            'age': age,
            'gender': gender,
            'doctor_id': doctor_id
        }
    }


@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO users (username, password_hash, role, full_name, age, gender, created_at, doctor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            request.username,
            hash_password(request.password),
            request.role,
            request.full_name,
            request.age,
            request.gender,
            datetime.now().isoformat(),
            request.doctor_id
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        token = create_token(user_id, request.username, request.role)
        
        return {
            'token': token,
            'user': {
                'id': user_id,
                'username': request.username,
                'role': request.role,
                'full_name': request.full_name
            }
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")
    finally:
        conn.close()


@app.get("/api/exercises")
async def get_exercises(current_user = Depends(get_current_user)):
    return {
        "exercises": [
            {"id": "squat", "name": "Squat (Gập gối)", "description": "Bài tập tăng cường cơ chân", "target_reps": 10},
            {"id": "arm_raise", "name": "Nâng Tay", "description": "Bài tập vai và tay", "target_reps": 15},
            {"id": "single_leg_stand", "name": "Đứng 1 Chân", "description": "Bài tập cân bằng và cơ chân", "target_reps": 5}
        ]
    }


@app.post("/api/sessions/start")
async def start_session(exercise_name: str, current_user = Depends(get_current_user)):
    session_id = session_manager.start_session(current_user['user_id'], exercise_name)
    return {'session_id': session_id}


@app.post("/api/sessions/{session_id}/end")
async def end_session(session_id: int, current_user = Depends(get_current_user)):
    result = session_manager.end_session()
    return result


@app.get("/api/sessions/my-history")
async def get_my_history(limit: int = 20, current_user = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, exercise_name, start_time, total_reps, correct_reps, accuracy, duration_seconds
        FROM sessions
        WHERE patient_id = ?
        ORDER BY start_time DESC
        LIMIT ?
    """, (current_user['user_id'], limit))
    
    sessions = []
    for row in cursor.fetchall():
        sessions.append({
            'id': row[0],
            'exercise_name': row[1],
            'start_time': row[2],
            'total_reps': row[3],
            'correct_reps': row[4],
            'accuracy': row[5],
            'duration_seconds': row[6]
        })
    
    conn.close()
    return {'sessions': sessions}


@app.get("/api/doctor/patients")
async def get_my_patients(current_user = Depends(get_current_user)):
    if current_user['role'] != 'doctor':
        raise HTTPException(status_code=403, detail="Doctors only")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, username, full_name, age, gender, created_at
        FROM users
        WHERE role = 'patient' AND doctor_id = ?
        ORDER BY full_name
    """, (current_user['user_id'],))
    
    patients = []
    for row in cursor.fetchall():
        # Get latest session
        cursor.execute("""
            SELECT start_time, exercise_name, accuracy
            FROM sessions
            WHERE patient_id = ?
            ORDER BY start_time DESC
            LIMIT 1
        """, (row[0],))
        
        last_session = cursor.fetchone()
        
        patients.append({
            'id': row[0],
            'username': row[1],
            'full_name': row[2],
            'age': row[3],
            'gender': row[4],
            'created_at': row[5],
            'last_session': {
                'date': last_session[0] if last_session else None,
                'exercise': last_session[1] if last_session else None,
                'accuracy': last_session[2] if last_session else None
            } if last_session else None
        })
    
    conn.close()
    return {'patients': patients}


@app.get("/api/doctor/patient/{patient_id}/history")
async def get_patient_history(patient_id: int, limit: int = 20, current_user = Depends(get_current_user)):
    if current_user['role'] != 'doctor':
        raise HTTPException(status_code=403, detail="Doctors only")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, exercise_name, start_time, total_reps, correct_reps, accuracy, duration_seconds
        FROM sessions
        WHERE patient_id = ?
        ORDER BY start_time DESC
        LIMIT ?
    """, (patient_id, limit))
    
    sessions = []
    for row in cursor.fetchall():
        # Get errors
        cursor.execute("""
            SELECT error_name, count, severity
            FROM session_errors
            WHERE session_id = ?
        """, (row[0],))
        
        errors = [{'name': e[0], 'count': e[1], 'severity': e[2]} for e in cursor.fetchall()]
        
        sessions.append({
            'id': row[0],
            'exercise_name': row[1],
            'start_time': row[2],
            'total_reps': row[3],
            'correct_reps': row[4],
            'accuracy': row[5],
            'duration_seconds': row[6],
            'errors': errors
        })
    
    conn.close()
    return {'sessions': sessions}


@app.websocket("/ws/exercise/{exercise_type}")
async def websocket_endpoint(websocket: WebSocket, exercise_type: str):
    await websocket.accept()
    
    angle_calc = AngleCalculator()
    rep_counter = RepetitionCounter(exercise_type)
    error_detector = ErrorDetector(exercise_type)
    
    last_process_time = 0
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message['type'] == 'frame':
                current_time = time.time()
                if current_time - last_process_time < 0.04:
                    continue
                last_process_time = current_time
                
                try:
                    img_data = base64.b64decode(message['data'].split(',')[1])
                    nparr = np.frombuffer(img_data, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if frame is None:
                        continue
                    
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    results = pose.process(rgb_frame)
                    
                    response = {'type': 'analysis', 'pose_detected': False}
                    
                    if results.pose_landmarks:
                        landmarks = results.pose_landmarks.landmark
                        angles = angle_calc.get_angles(landmarks, exercise_type)
                        
                        # ✅ GỌI update() thay vì count()
                        rep_count = rep_counter.update(angles)
                        
                        # Get current state
                        current_state = rep_counter.get_state()
                        
                        # Detect errors with state
                        errors = error_detector.detect_errors(landmarks, angles, current_state)
                        
                        session_manager.log_frame(rep_count, angles, errors)
                        
                        pose_landmarks = [
                            {'x': lm.x, 'y': lm.y, 'z': lm.z, 'visibility': lm.visibility}
                            for lm in landmarks
                        ]
                        
                        # ✅ Feedback based on exercise type and state
                        if errors:
                            feedback_msg = errors[0]['message']
                        else:
                            if exercise_type == "single_leg_stand":
                                # Special feedback for single leg stand
                                if current_state == ExerciseState.READY:
                                    side_text = "trái" if rep_counter.get_current_side() == "left" else "phải"
                                    feedback_msg = f'🟢 Sẵn sàng - Co chân {side_text} lên'
                                elif current_state == ExerciseState.LIFTING:
                                    feedback_msg = '⬆️ Đang co chân lên...'
                                elif current_state == ExerciseState.HOLDING:
                                    remaining = rep_counter.get_hold_time_remaining()
                                    if remaining:
                                        feedback_msg = f'⏱️ Giữ vững! Còn {int(remaining)}s'
                                    else:
                                        feedback_msg = '⏱️ Giữ vững!'
                                elif current_state == ExerciseState.LOWERING:
                                    feedback_msg = '⬇️ Hạ chân từ từ...'
                                elif current_state == ExerciseState.SWITCH_SIDE:
                                    feedback_msg = '🔄 Tốt lắm! Đổi bên'
                                elif current_state == ExerciseState.COMPLETE:
                                    feedback_msg = '✅ Hoàn thành 1 rep!'
                                else:
                                    feedback_msg = '✓ Tư thế tốt!'
                            else:
                                # Existing feedback for other exercises
                                if current_state == ExerciseState.RAISING:
                                    feedback_msg = '⬆️ Đang nâng...'
                                elif current_state == ExerciseState.UP:
                                    feedback_msg = '✅ Giữ vững!'
                                elif current_state == ExerciseState.LOWERING:
                                    feedback_msg = '⬇️ Đang hạ...'
                                elif current_state == ExerciseState.DOWN:
                                    feedback_msg = '🟢 Sẵn sàng!'
                                else:
                                    feedback_msg = '✓ Tư thế tốt!'
                        
                        # ✅ Additional data for single_leg_stand
                        extra_data = {}
                        if exercise_type == "single_leg_stand":
                            extra_data['hold_time_remaining'] = rep_counter.get_hold_time_remaining()
                            extra_data['current_side'] = rep_counter.get_current_side()
                        
                        response = {
                            'type': 'analysis',
                            'pose_detected': True,
                            'landmarks': pose_landmarks,
                            'angles': {k: round(v, 1) if isinstance(v, (int, float)) else v for k, v in angles.items()},
                            'rep_count': rep_count,
                            'errors': errors,
                            'feedback': feedback_msg,
                            'state': current_state.value,
                            **extra_data
                        }
                    
                    await websocket.send_json(response)
                    
                except Exception as e:
                    print(f"Frame error: {e}")
                    import traceback
                    traceback.print_exc()  # ✅ In full traceback để debug
                    continue
            
            elif message['type'] == 'reset':
                rep_counter.reset()
                error_detector.error_timers.clear()
                await websocket.send_json({'type': 'reset_confirmed'})
    
    except WebSocketDisconnect:
        print("Client disconnected")


if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 Rehab System V3 - Full Features")
    print("=" * 60)
    print("📡 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("\n👤 Default Accounts:")
    print("   Doctor: doctor1 / doctor123")
    print("   Patient: patient1 / patient123")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
