import sqlite3

conn = sqlite3.connect('rehab_v3.db')
cursor = conn.cursor()

cursor.execute('SELECT id, exercise_name, total_reps, correct_reps, accuracy FROM sessions ORDER BY id DESC LIMIT 5')
print('\n📊 Last 5 sessions in database:')
print('-' * 80)
for row in cursor.fetchall():
    print(f'  ID={row[0]:<3} Exercise={row[1]:<20} Total={row[2]:<3} Correct={row[3]:<3} Accuracy={row[4]:.1f}%')

print('\n🔍 Checking session errors:')
cursor.execute('''
    SELECT s.id, s.exercise_name, s.total_reps, GROUP_CONCAT(se.error_name || '(' || se.count || ')', ', ') as errors
    FROM sessions s
    LEFT JOIN session_errors se ON s.id = se.session_id
    WHERE s.id IN (SELECT id FROM sessions ORDER BY id DESC LIMIT 3)
    GROUP BY s.id
    ORDER BY s.id DESC
''')
print('-' * 80)
for row in cursor.fetchall():
    print(f'  ID={row[0]}: {row[1]} - {row[2]} reps - Errors: {row[3] or "None"}')

conn.close()
