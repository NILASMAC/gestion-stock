import psycopg2

DATABASE_URL = "postgresql://stockuser:l3fuyJNVKhU7BqEiH1CyGsX52VMRc4Z7@dpg-d7abeb8gjchc73fmu120-a.oregon-postgres.render.com/stockdb_p9ma?sslmode=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Détail des produits
print("📦 PRODUITS :")
cur.execute("SELECT * FROM products;")
for row in cur.fetchall():
    print(f"  ID: {row[0]}, Nom: {row[1]}, Ref: {row[2]}, Stock: {row[4]}, Prix: {row[6]}")

# Détail des utilisateurs
print("\n👤 UTILISATEURS :")
cur.execute("SELECT id, nom, email, role FROM users;")
for row in cur.fetchall():
    print(f"  ID: {row[0]}, Nom: {row[1]}, Email: {row[2]}, Rôle: {row[3]}")

# Détail des ventes
print("\n💰 VENTES :")
cur.execute("SELECT id, product_id, quantite, prix_total, statut FROM ventes;")
for row in cur.fetchall():
    print(f"  ID: {row[0]}, Produit: {row[1]}, Qté: {row[2]}, Total: {row[3]}, Statut: {row[4]}")

cur.close()
conn.close()