# fix_postgres_sequence.py
import psycopg2
from werkzeug.security import generate_password_hash

DATABASE_URL = "postgresql://stockuser:l3fuyJNVKhU7BqEiH1CyGsX52VMRc4Z7@dpg-d7abeb8gjchc73fmu120-a.oregon-postgres.render.com/stockdb_p9ma?sslmode=require"

def fix_sequence():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Fix the sequence for users table
        cur.execute("""
            -- Create sequence if it doesn't exist
            CREATE SEQUENCE IF NOT EXISTS users_id_seq;
            
            -- Set the sequence to start from max id + 1
            SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1);
            
            -- Set the default value for id column
            ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
            
            -- Make sure the sequence owns the column
            ALTER SEQUENCE users_id_seq OWNED BY users.id;
        """)
        
        conn.commit()
        print("✅ PostgreSQL sequence fixed for users table")
        
        # Test the fix
        cur.execute("""
            INSERT INTO users (nom, email, password_hash, role, is_active, nom_boutique, created_at) 
            VALUES ('TestUser', 'test_seq@example.com', 'test_hash', 'gerant', true, 'Test', NOW())
            RETURNING id;
        """)
        new_id = cur.fetchone()[0]
        print(f"✅ Test insert successful! Generated ID: {new_id}")
        
        # Rollback the test insert
        conn.rollback()
        print("✅ Test rolled back")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_sequence()