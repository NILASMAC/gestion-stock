import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = "postgresql://stockuser:l3fuyJNVKhU7BqEiH1CyGsX52VMRc4Z7@dpg-d7abeb8gjchc73fmu120-a.oregon-postgres.render.com/stockdb_p9ma?sslmode=require"

def migrate_remove_password_plain():
    conn = None
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("🔍 Checking if password_plain column exists...")
        
        # Check if column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='password_plain'
        """)
        
        column_exists = cur.fetchone()
        
        if column_exists:
            print("✅ password_plain column found. Removing...")
            
            # Remove the column
            cur.execute("ALTER TABLE users DROP COLUMN password_plain;")
            conn.commit()
            print("✅ Successfully removed password_plain column!")
        else:
            print("ℹ️ password_plain column doesn't exist - already migrated!")
        
        # Verify the column is gone
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users'
        """)
        
        columns = [row[0] for row in cur.fetchall()]
        print(f"\n📋 Current columns in users table: {columns}")
        
        if 'password_plain' not in columns:
            print("\n✅ Migration completed successfully!")
        else:
            print("\n❌ Migration failed - column still exists!")
            
        cur.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🚀 Starting migration to remove password_plain column...")
    migrate_remove_password_plain() 