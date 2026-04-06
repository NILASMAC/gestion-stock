import psycopg2
import json

conn = psycopg2.connect(
    host="localhost",
    port="5432",
    database="gestion_stock",
    user="postgres",
    password="LOLO"
)

cursor = conn.cursor()

cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
""")

tables = cursor.fetchall()
data = {}

for table in tables:
    table_name = table[0]
    cursor.execute(f'SELECT * FROM "{table_name}"')
    rows = cursor.fetchall()
    
    cursor.execute(f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '{table_name}'
        ORDER BY ordinal_position;
    """)
    columns = [col[0] for col in cursor.fetchall()]
    
    data[table_name] = []
    for row in rows:
        data[table_name].append(dict(zip(columns, row)))

with open('backup.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, default=str)

print(f"Export termine ! {len(tables)} tables exportees")

cursor.close()
conn.close()
