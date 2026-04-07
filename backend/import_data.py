import json
import psycopg2

DATABASE_URL = "postgresql://stockuser:l3fuyJNVKhU7BqEiH1CyGsX52VMRc4Z7@dpg-d7abeb8gjchc73fmu120-a.oregon-postgres.render.com/stockdb_p9ma?sslmode=require"

def import_data():
    # Lire le fichier backup.json
    with open('backup.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # Importer les produits
        for product in data['products']:
            cur.execute("""
                INSERT INTO products (id, nom, reference, description, quantite, prix_unitaire, prix_vente, seuil_alerte, image_url, categorie, created_at, image_base64)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (product['id'], product['nom'], product['reference'], product['description'], product['quantite'], product['prix_unitaire'], product['prix_vente'], product['seuil_alerte'], product['image_url'], product['categorie'], product['created_at'], product.get('image_base64')))
        
        # Importer les utilisateurs
        for user in data['users']:
            cur.execute("""
                INSERT INTO users (id, nom, email, password_hash, password_plain, role, is_active, nom_boutique, telephone, adresse, created_at, photo_base64)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (user['id'], user['nom'], user['email'], user['password_hash'], user['password_plain'], user['role'], user['is_active'], user.get('nom_boutique'), user.get('telephone'), user.get('adresse'), user['created_at'], user.get('photo_base64')))
        
        # Importer les ventes
        for vente in data['ventes']:
            cur.execute("""
                INSERT INTO ventes (id, product_id, gerant_id, quantite, prix_total, note, date_vente, numero_facture, prix_unitaire, client_nom, client_telephone, client_adresse, facture_envoyee, statut)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (vente['id'], vente['product_id'], vente['gerant_id'], vente['quantite'], vente['prix_total'], vente.get('note'), vente['date_vente'], vente['numero_facture'], vente['prix_unitaire'], vente['client_nom'], vente['client_telephone'], vente.get('client_adresse'), vente['facture_envoyee'], vente['statut']))
        
        # Importer les notifications
        for notif in data['notifications']:
            cur.execute("""
                INSERT INTO notifications (id, user_id, message, type, is_read, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (notif['id'], notif['user_id'], notif['message'], notif['type'], notif['is_read'], notif['created_at']))
        
        # Importer les assignments
        for assign in data['product_assignments']:
            cur.execute("""
                INSERT INTO product_assignments (id, product_id, gerant_id, quantite_assignee, assigned_at)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (assign['id'], assign['product_id'], assign['gerant_id'], assign['quantite_assignee'], assign['assigned_at']))
        
        conn.commit()
        print("✅ Données importées avec succès !")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    import_data()