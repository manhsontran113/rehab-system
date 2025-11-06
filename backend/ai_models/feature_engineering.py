"""
Feature Engineering for AI Personalization
Extracts and processes biometric data for ML models
"""

import json
from typing import Dict, Any


class BiometricFeatures:
    """Extract and process biometric features for AI personalization"""
    
    @staticmethod
    def calculate_bmi(weight_kg: float, height_cm: float) -> float:
        """
        Calculate Body Mass Index
        
        Args:
            weight_kg: Weight in kilograms
            height_cm: Height in centimeters
            
        Returns:
            BMI value
        """
        height_m = height_cm / 100
        return weight_kg / (height_m ** 2)
    
    @staticmethod
    def get_age_category(age: int) -> str:
        """
        Categorize age into groups
        
        Categories:
        - young: 18-40
        - middle: 41-60
        - senior: 61-75
        - elderly: 76+
        
        Args:
            age: Age in years
            
        Returns:
            Age category string
        """
        if age <= 40:
            return "young"
        elif age <= 60:
            return "middle"
        elif age <= 75:
            return "senior"
        else:
            return "elderly"
    
    @staticmethod
    def get_bmi_category(bmi: float) -> str:
        """
        Categorize BMI according to WHO standards
        
        Categories:
        - underweight: <18.5
        - normal: 18.5-24.9
        - overweight: 25-29.9
        - obese: 30+
        
        Args:
            bmi: BMI value
            
        Returns:
            BMI category string
        """
        if bmi < 18.5:
            return "underweight"
        elif bmi < 25:
            return "normal"
        elif bmi < 30:
            return "overweight"
        else:
            return "obese"
    
    @staticmethod
    def extract_features(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract comprehensive feature vector from user data
        
        Args:
            user_data: Dictionary containing user biometric and medical data
            
        Returns:
            Dictionary of extracted features ready for ML models
        """
        age = user_data.get('age', 50)
        weight = user_data.get('weight_kg', 70)
        height = user_data.get('height_cm', 170)
        medical_conditions_str = user_data.get('medical_conditions', '[]')
        
        # Parse medical conditions if string
        try:
            medical_conditions = json.loads(medical_conditions_str) if isinstance(medical_conditions_str, str) else medical_conditions_str or []
        except json.JSONDecodeError:
            medical_conditions = []
        
        # Calculate BMI
        bmi = BiometricFeatures.calculate_bmi(weight, height) if weight and height else 22
        
        # Encode categorical variables
        gender_map = {'male': 1, 'female': 0, 'other': 0.5}
        mobility_map = {'beginner': 0, 'intermediate': 1, 'advanced': 2}
        
        # Check for specific medical conditions
        medical_text = ' '.join(medical_conditions).lower()
        
        # Knee-related conditions
        knee_keywords = ['knee', 'arthritis', 'osteoarthritis', 'gối', 'viêm khớp']
        has_knee_issues = any(kw in medical_text for kw in knee_keywords)
        
        # Shoulder-related conditions
        shoulder_keywords = ['shoulder', 'rotator', 'vai', 'rotator cuff']
        has_shoulder_issues = any(kw in medical_text for kw in shoulder_keywords)
        
        # Back-related conditions
        back_keywords = ['back', 'spine', 'lưng', 'cột sống', 'herniated', 'disc']
        has_back_issues = any(kw in medical_text for kw in back_keywords)
        
        return {
            # Raw values
            'age': age,
            'bmi': bmi,
            'weight_kg': weight,
            'height_cm': height,
            
            # Categories
            'age_category': BiometricFeatures.get_age_category(age),
            'bmi_category': BiometricFeatures.get_bmi_category(bmi),
            
            # Encoded values
            'gender_encoded': gender_map.get(user_data.get('gender', 'other'), 0.5),
            'mobility_level_encoded': mobility_map.get(user_data.get('mobility_level', 'beginner'), 0),
            
            # Medical conditions (binary flags)
            'has_knee_issues': 1 if has_knee_issues else 0,
            'has_shoulder_issues': 1 if has_shoulder_issues else 0,
            'has_back_issues': 1 if has_back_issues else 0,
            
            # Pain and mobility
            'pain_level': user_data.get('pain_level', 0),
            'mobility_level': user_data.get('mobility_level', 'beginner'),
            
            # Medical conditions list
            'medical_conditions': medical_conditions,
        }
