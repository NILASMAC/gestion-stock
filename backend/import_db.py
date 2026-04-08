import psycopg2
import json
import os

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Variable DATABASE_URL non trouvee")
    exit(1)

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

with open('backup.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for table_name, rows in data.items():
    if not rows:
        continue
    
    columns = list(rows[0].keys())
    placeholders = ','.join(['%s'] * len(columns))
    columns_str = ','.join([f'"{col}"' for col in columns])
    
    for row in rows:
        values = [row[col] for col in columns]
        query = f'INSERT INTO "{table_name}" ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
        try:
            cursor.execute(query, values)
        except Exception as e:
            print(f"Erreur sur {table_name}: {e}")

conn.commit()
print("Import termine !")

cursor.close()
conn.close()