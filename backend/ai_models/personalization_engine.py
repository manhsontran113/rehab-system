"""
AI Personalization Engine
Calculates personalized exercise parameters based on user biometrics and medical conditions
"""

from typing import Dict, List, Any
from .feature_engineering import BiometricFeatures


class PersonalizationEngine:
    """
    AI Engine for calculating personalized exercise parameters
    
    Approach: Rule-based (expert knowledge) + configurable for future ML integration
    """
    
    def __init__(self):
        # Baseline thresholds for healthy young adults
        self.baseline_thresholds = {
            'squat': {
                'down_angle': 90,   # Knee flexion 90 degrees
                'up_angle': 160,    # Standing straight 160 degrees
                'max_reps': 20,
                'rest_seconds': 30,
            },
            'arm_raise': {
                'up_angle': 160,    # Arm raise 160 degrees
                'down_angle': 90,   # Arm down 90 degrees
                'max_reps': 15,
                'rest_seconds': 20,
            },
            'calf_raise': {
                'max_reps': 15,
                'rest_seconds': 20,
            },
            'single_leg_stand': {
                'hold_seconds': 10,
                'rest_seconds': 30,
            }
        }
    
    def calculate_personalized_params(self, user_data: Dict[str, Any], exercise_type: str) -> Dict[str, Any]:
        """
        Calculate personalized exercise parameters for a specific user
        
        Args:
            user_data: Dictionary containing user biometric and medical data
            exercise_type: Type of exercise (squat, arm_raise, etc.)
            
        Returns:
            Dictionary with personalized parameters, warnings, and recommendations
        """
        # Extract features
        features = BiometricFeatures.extract_features(user_data)
        
        # Get baseline for this exercise
        baseline = self.baseline_thresholds.get(exercise_type, {})
        
        if not baseline:
            return {
                'error': f'Unknown exercise type: {exercise_type}',
                'warnings': [f'⚠️ Bài tập "{exercise_type}" chưa được hỗ trợ'],
                'recommendations': []
            }
        
        # Calculate adjustment factors
        age_factor = self._calculate_age_factor(features['age'])
        bmi_factor = self._calculate_bmi_factor(features['bmi'])
        medical_factor = self._calculate_medical_factor(features, exercise_type)
        mobility_factor = self._calculate_mobility_factor(features['mobility_level_encoded'])
        pain_factor = self._calculate_pain_factor(features['pain_level'])
        
        # Combine factors (weighted average)
        combined_factor = (
            age_factor * 0.30 +      # Age is most important
            bmi_factor * 0.20 +      # BMI affects joint stress
            medical_factor * 0.25 +  # Medical conditions
            mobility_factor * 0.15 + # Current mobility level
            pain_factor * 0.10       # Current pain level
        )
        
        # Apply adjustments to baseline
        adjusted_params = self._apply_adjustments(baseline, combined_factor, exercise_type)
        
        # Generate warnings and recommendations
        warnings = self._generate_warnings(features, exercise_type, combined_factor)
        recommendations = self._generate_recommendations(features, exercise_type)
        
        return {
            **adjusted_params,
            'difficulty_score': combined_factor,
            'age_factor': age_factor,
            'bmi_factor': bmi_factor,
            'medical_factor': medical_factor,
            'mobility_factor': mobility_factor,
            'pain_factor': pain_factor,
            'warnings': warnings,
            'recommendations': recommendations,
        }
    
    # ===== FACTOR CALCULATION METHODS =====
    
    def _calculate_age_factor(self, age: int) -> float:
        """
        Calculate age adjustment factor
        
        Returns value between 0.5 (much easier) and 1.0 (normal)
        - 18-40: 1.0 (normal difficulty)
        - 41-60: 0.85 (slightly easier)
        - 61-75: 0.70 (easier)
        - 76+: 0.50 (much easier)
        """
        if age <= 40:
            return 1.0
        elif age <= 60:
            return 0.85
        elif age <= 75:
            return 0.70
        else:
            return 0.50
    
    def _calculate_bmi_factor(self, bmi: float) -> float:
        """
        Calculate BMI adjustment factor
        
        Higher BMI = easier exercises (less joint stress)
        - Underweight (<18.5): 0.90
        - Normal (18.5-24.9): 1.0
        - Overweight (25-29.9): 0.85
        - Obese (30+): 0.70
        """
        if bmi < 18.5:
            return 0.90  # Underweight also needs caution
        elif bmi < 25:
            return 1.0   # Normal range
        elif bmi < 30:
            return 0.85  # Overweight
        else:
            return 0.70  # Obese - much easier to protect joints
    
    def _calculate_medical_factor(self, features: Dict[str, Any], exercise_type: str) -> float:
        """
        Calculate medical condition adjustment factor
        
        If user has conditions related to the exercise, make it easier
        """
        factor = 1.0
        
        if exercise_type == "squat":
            if features['has_knee_issues']:
                factor *= 0.70  # 30% easier for knee issues
            if features['has_back_issues']:
                factor *= 0.80  # 20% easier for back issues
        
        elif exercise_type == "arm_raise":
            if features['has_shoulder_issues']:
                factor *= 0.70  # 30% easier for shoulder issues
        
        elif exercise_type == "single_leg_stand":
            if features['has_knee_issues']:
                factor *= 0.75  # 25% easier for knee issues
        
        return factor
    
    def _calculate_mobility_factor(self, mobility_encoded: int) -> float:
        """
        Calculate mobility level adjustment factor
        
        - Beginner (0): 0.70
        - Intermediate (1): 0.85
        - Advanced (2): 1.0
        """
        mobility_map = {0: 0.70, 1: 0.85, 2: 1.0}
        return mobility_map.get(mobility_encoded, 0.70)
    
    def _calculate_pain_factor(self, pain_level: int) -> float:
        """
        Calculate pain level adjustment factor
        
        Higher pain = easier exercises
        - Pain 0-2: 1.0 (normal)
        - Pain 3-5: 0.85
        - Pain 6-8: 0.70
        - Pain 9-10: 0.50 (very easy or should not exercise)
        """
        if pain_level <= 2:
            return 1.0
        elif pain_level <= 5:
            return 0.85
        elif pain_level <= 8:
            return 0.70
        else:
            return 0.50
    
    # ===== ADJUSTMENT APPLICATION =====
    
    def _apply_adjustments(self, baseline: Dict[str, Any], factor: float, exercise_type: str) -> Dict[str, Any]:
        """
        Apply combined factor to baseline thresholds
        
        Logic:
        - Angles: reduce range of motion (less deep squat, less high arm raise)
        - Reps: reduce count
        - Rest: increase rest time
        """
        adjusted = {}
        
        if exercise_type == "squat":
            # Baseline: down=90, up=160
            # Lower factor = easier = less deep squat (higher angle)
            baseline_down = baseline.get('down_angle', 90)
            adjusted['down_angle'] = baseline_down + (180 - baseline_down) * (1 - factor)
            adjusted['up_angle'] = baseline.get('up_angle', 160)
            adjusted['max_reps'] = int(baseline.get('max_reps', 20) * factor)
            adjusted['rest_seconds'] = int(baseline.get('rest_seconds', 30) / factor)
        
        elif exercise_type == "arm_raise":
            # Baseline: up=160, down=90
            # Lower factor = easier = lower arm raise (lower angle)
            baseline_up = baseline.get('up_angle', 160)
            adjusted['up_angle'] = 90 + (baseline_up - 90) * factor
            adjusted['down_angle'] = baseline.get('down_angle', 90)
            adjusted['max_reps'] = int(baseline.get('max_reps', 15) * factor)
            adjusted['rest_seconds'] = int(baseline.get('rest_seconds', 20) / factor)
        
        elif exercise_type == "calf_raise":
            adjusted['max_reps'] = int(baseline.get('max_reps', 15) * factor)
            adjusted['rest_seconds'] = int(baseline.get('rest_seconds', 20) / factor)
        
        elif exercise_type == "single_leg_stand":
            baseline_hold = baseline.get('hold_seconds', 10)
            adjusted['hold_seconds'] = max(3, int(baseline_hold * factor))  # Minimum 3 seconds
            adjusted['rest_seconds'] = int(baseline.get('rest_seconds', 30) / factor)
        
        # Ensure minimum values
        adjusted['max_reps'] = max(5, adjusted.get('max_reps', 10))
        adjusted['rest_seconds'] = max(15, adjusted.get('rest_seconds', 20))
        
        return adjusted
    
    # ===== WARNING & RECOMMENDATION GENERATION =====
    
    def _generate_warnings(self, features: Dict[str, Any], exercise_type: str, difficulty: float) -> List[str]:
        """Generate safety warnings based on user profile"""
        warnings = []
        
        # High pain level warning
        if features['pain_level'] >= 7:
            warnings.append("⚠️ Mức đau cao - Nên tham khảo bác sĩ trước khi tập")
            warnings.append("⚠️ Có thể tạm dừng tập luyện cho đến khi đau giảm")
        
        # Obesity + knee exercises
        if features['bmi'] >= 30 and exercise_type in ['squat', 'single_leg_stand']:
            warnings.append("⚠️ BMI cao - Hạn chế độ sâu để bảo vệ đầu gối")
            warnings.append("⚠️ Nên tập trên bề mặt mềm (thảm tập)")
        
        # Elderly + balance exercises
        if features['age'] >= 75 and exercise_type == 'single_leg_stand':
            warnings.append("⚠️ Nên có người hoặc vật hỗ trợ khi tập đứng 1 chân")
            warnings.append("⚠️ Tránh ngã - tập gần tường hoặc ghế")
        
        # Exercise-specific medical warnings
        if features['has_knee_issues'] and exercise_type == 'squat':
            warnings.append("⚠️ Có vấn đề đầu gối - Không gập quá sâu")
            warnings.append("⚠️ Dừng ngay nếu cảm thấy đau đầu gối")
        
        if features['has_shoulder_issues'] and exercise_type == 'arm_raise':
            warnings.append("⚠️ Có vấn đề vai - Không nâng tay quá cao")
            warnings.append("⚠️ Dừng ngay nếu cảm thấy đau vai")
        
        if features['has_back_issues'] and exercise_type == 'squat':
            warnings.append("⚠️ Có vấn đề lưng - Giữ lưng thẳng suốt bài tập")
        
        # Very easy difficulty warning
        if difficulty < 0.6:
            warnings.append("💡 Bài tập đã được điều chỉnh dễ hơn phù hợp với bạn")
        
        return warnings
    
    def _generate_recommendations(self, features: Dict[str, Any], exercise_type: str) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Beginner recommendations
        if features['mobility_level_encoded'] == 0:
            recommendations.append("💡 Bắt đầu chậm, tập trung vào tư thế đúng hơn là số lượng")
            recommendations.append("💡 Có thể giảm số rep và tăng dần theo thời gian")
        
        # Age-based recommendations
        if features['age'] >= 65:
            recommendations.append("💡 Khởi động kỹ 5-10 phút trước khi tập")
            recommendations.append("💡 Nghỉ ngơi đầy đủ giữa các set")
            recommendations.append("💡 Uống nước trước, trong và sau tập")
        
        # BMI-based recommendations
        if features['bmi'] >= 30:
            recommendations.append("💡 Có thể chia nhỏ thành nhiều set ngắn")
            recommendations.append("💡 Tập nhẹ nhưng đều đặn mỗi ngày")
        elif features['bmi'] < 18.5:
            recommendations.append("💡 Kết hợp với dinh dưỡng tốt để tăng cường sức khỏe")
        
        # Exercise-specific recommendations
        if exercise_type == 'squat':
            recommendations.append("💡 Giữ lưng thẳng, ngực dạng ra")
            recommendations.append("💡 Đầu gối không vượt qua mũi chân")
            if features['has_knee_issues']:
                recommendations.append("💡 Có thể tập với ghế hỗ trợ phía sau")
        
        elif exercise_type == 'arm_raise':
            recommendations.append("💡 Giữ tay thẳng, không gập khuỷu tay")
            recommendations.append("💡 Nâng và hạ tay đều đặn, không giật")
            if features['has_shoulder_issues']:
                recommendations.append("💡 Dừng ở góc thoải mái, không ép quá mức")
        
        elif exercise_type == 'calf_raise':
            recommendations.append("💡 Nâng gót chân cao nhất có thể")
            recommendations.append("💡 Giữ thăng bằng bằng cách đứng gần tường")
        
        elif exercise_type == 'single_leg_stand':
            recommendations.append("💡 Tập gần tường hoặc ghế để hỗ trợ thăng bằng")
            recommendations.append("💡 Tập luân phiên giữa hai chân")
        
        # Pain management
        if features['pain_level'] > 0:
            recommendations.append("💡 Dừng ngay nếu đau tăng lên trong khi tập")
            recommendations.append("💡 Có thể chườm nóng trước tập và chườm lạnh sau tập")
        
        return recommendations
