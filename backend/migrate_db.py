"""
Database Migration Script
Adds biometric and medical fields to existing users table
"""

import sqlite3
from pathlib import Path

DB_PATH = Path("rehab_v3.db")

def migrate_database():
    """Add new columns to users table for AI personalization"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get current columns
    cursor.execute("PRAGMA table_info(users)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    print(f"Existing columns: {existing_columns}")
    
    # Add new columns if they don't exist
    new_columns = [
        ("height_cm", "REAL"),
        ("weight_kg", "REAL"),
        ("bmi", "REAL"),
        ("medical_conditions", "TEXT"),
        ("injury_type", "TEXT"),
        ("mobility_level", "TEXT"),
        ("pain_level", "INTEGER"),
        ("doctor_notes", "TEXT"),
        ("contraindicated_exercises", "TEXT"),
    ]
    
    for column_name, column_type in new_columns:
        if column_name not in existing_columns:
            try:
                query = f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"
                cursor.execute(query)
                print(f"✅ Added column: {column_name}")
            except sqlite3.OperationalError as e:
                print(f"⚠️ Column {column_name} already exists or error: {e}")
    
    # Create user_exercise_limits table if not exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_exercise_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            exercise_type TEXT NOT NULL,
            max_depth_angle REAL,
            min_raise_angle REAL,
            max_reps_per_set INTEGER,
            recommended_rest_seconds INTEGER,
            difficulty_score REAL,
            injury_risk_score REAL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    print("✅ Created/verified user_exercise_limits table")
    
    conn.commit()
    conn.close()
    
    print("\n🎉 Database migration completed successfully!")

if __name__ == "__main__":
    print("=" * 60)
    print("🔄 Running Database Migration")
    print("=" * 60)
    migrate_database()
