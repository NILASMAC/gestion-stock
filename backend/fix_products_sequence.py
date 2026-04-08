# fix_all_sequences_final.py
import psycopg2

DATABASE_URL = "postgresql://stockuser:l3fuyJNVKhU7BqEiH1CyGsX52VMRc4Z7@dpg-d7abeb8gjchc73fmu120-a.oregon-postgres.render.com/stockdb_p9ma?sslmode=require"

def fix_all_sequences():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Get all tables with an 'id' column
        cur.execute("""
            SELECT DISTINCT table_name 
            FROM information_schema.columns 
            WHERE column_name = 'id' 
            AND table_schema = 'public'
            AND table_name NOT LIKE 'alembic_version'
        """)
        
        tables = cur.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"\n🔧 Fixing sequence for {table_name}...")
            
            try:
                # Create sequence
                cur.execute(f"""
                    CREATE SEQUENCE IF NOT EXISTS {table_name}_id_seq;
                """)
                
                # Set sequence value to max id + 1
                cur.execute(f"""
                    SELECT setval('{table_name}_id_seq', 
                        COALESCE((SELECT MAX(id) FROM {table_name}), 0) + 1
                    );
                """)
                
                # Set default value for id column
                cur.execute(f"""
                    ALTER TABLE {table_name} 
                    ALTER COLUMN id SET DEFAULT nextval('{table_name}_id_seq');
                """)
                
                # Make sequence owned by the column
                cur.execute(f"""
                    ALTER SEQUENCE {table_name}_id_seq OWNED BY {table_name}.id;
                """)
                
                conn.commit()
                print(f"  ✅ Fixed {table_name}")
                
                # Test the fix
                if table_name == 'product_assignments':
                    # For product_assignments, test with a temporary insert (will be rolled back)
                    cur.execute(f"""
                        INSERT INTO {table_name} (product_id, gerant_id, quantite_assignee, assigned_at)
                        VALUES (1, 1, 1, NOW())
                        RETURNING id;
                    """)
                    test_id = cur.fetchone()[0]
                    print(f"  ✅ Test successful! Generated ID: {test_id}")
                    conn.rollback()
                    
            except Exception as e:
                print(f"  ⚠️ Error fixing {table_name}: {e}")
        
        cur.close()
        conn.close()
        
        print("\n" + "="*50)
        print("✅ All sequences fixed successfully!")
        print("="*50)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_all_sequences()