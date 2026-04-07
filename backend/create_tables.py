import psycopg2

DATABASE_URL = "postgresql://stockuser:l3fuyJNVKhU7BqEiH1CyGsX52VMRc4Z7@dpg-d7abeb8gjchc73fmu120-a.oregon-postgres.render.com/stockdb_p9ma?sslmode=require"

def create_tables():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Supprimer les tables si elles existent (optionnel)
    cur.execute("DROP TABLE IF EXISTS product_assignments, notifications, ventes, users, products CASCADE;")
    
    # Créer les tables
    cur.execute("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            nom VARCHAR(200),
            reference VARCHAR(100),
            description TEXT,
            quantite INTEGER,
            prix_unitaire FLOAT,
            prix_vente FLOAT,
            seuil_alerte INTEGER,
            image_url TEXT,
            categorie VARCHAR(100),
            created_at TIMESTAMP,
            image_base64 TEXT
        );
        
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            nom VARCHAR(100),
            email VARCHAR(100),
            password_hash TEXT,
            password_plain TEXT,
            role VARCHAR(50),
            is_active BOOLEAN,
            nom_boutique VARCHAR(100),
            telephone VARCHAR(50),
            adresse TEXT,
            created_at TIMESTAMP,
            photo_base64 TEXT
        );
        
        CREATE TABLE ventes (
            id INTEGER PRIMARY KEY,
            product_id INTEGER,
            gerant_id INTEGER,
            quantite INTEGER,
            prix_total FLOAT,
            note TEXT,
            date_vente TIMESTAMP,
            numero_facture VARCHAR(100),
            prix_unitaire FLOAT,
            client_nom VARCHAR(200),
            client_telephone VARCHAR(50),
            client_adresse TEXT,
            facture_envoyee BOOLEAN,
            statut VARCHAR(50)
        );
        
        CREATE TABLE notifications (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            message TEXT,
            type VARCHAR(50),
            is_read BOOLEAN,
            created_at TIMESTAMP
        );
        
        CREATE TABLE product_assignments (
            id INTEGER PRIMARY KEY,
            product_id INTEGER,
            gerant_id INTEGER,
            quantite_assignee INTEGER,
            assigned_at TIMESTAMP
        );
    """)
    
    conn.commit()
    print("✅ Tables créées avec succès !")
    cur.close()
    conn.close()

if __name__ == "__main__":
    create_tables()