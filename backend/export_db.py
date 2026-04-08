import psycopg2
import json
import os

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Variable DATABASE_URL non trouvee")
    exit(1)

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

TABLES = [
    'alembic_version',
    'notifications',
    'product_assignments',
    'products',
    'users',
    'ventes'
]

backup = {}

for table in TABLES:
    try:
        cursor.execute(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '{table}' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        """)
        columns = [row[0] for row in cursor.fetchall()]

        cursor.execute(f'SELECT * FROM "{table}"')
        rows = cursor.fetchall()

        table_data = []
        for row in rows:
            row_dict = {}
            for i, col in enumerate(columns):
                value = row[i]
                if hasattr(value, 'isoformat'):
                    value = str(value)
                row_dict[col] = value
            table_data.append(row_dict)

        backup[table] = table_data
        print(f"✅ {table}: {len(rows)} lignes exportées")

    except Exception as e:
        print(f"❌ Erreur sur {table}: {e}")
        backup[table] = []

with open('backup.json', 'w', encoding='utf-8') as f:
    json.dump(backup, f, ensure_ascii=False, indent=2)

print(f"\n===== EXPORT TERMINÉ =====")
print(f"Fichier mis à jour : backup.json")
print(f"Tables exportées : {len(backup)}")
print(f"==========================")

cursor.close()
conn.close()