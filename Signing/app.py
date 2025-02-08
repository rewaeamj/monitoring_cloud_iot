from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])   
bcrypt = Bcrypt(app)
app.config['JWT_SECRET_KEY'] = 'votre-secret-key'  # Changez ceci en production
jwt = JWTManager(app)

# Connexion à PostgreSQL
conn = psycopg2.connect(
    dbname="db_auth",
    user="postgres",
    password="1234",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# ✅ Route pour ajouter un utilisateur
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    print("Données reçues:", data)  # Debugging

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    email = data["email"]
    password = data["password"]

    # Hachage du mot de passe
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    print("Mot de passe hache:", hashed_password)  # Debugging

    try:
        cursor.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, hashed_password))
        conn.commit()
        return jsonify({"message": "Utilisateur ajoute avec succes"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Erreur de connexion. Vérifiez vos identifiants."}), 400

    cursor.execute("SELECT password FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user is None:
        return jsonify({"error": "Utilisateur non trouve"}), 401

    hashed_password = user[0]

    if not hashed_password.startswith("$2b$"):
        return jsonify({"error": "Erreur interne : mot de passe invalide en base"}), 500

    if bcrypt.check_password_hash(hashed_password, password):
        # Générer un token JWT
        access_token = create_access_token(
            identity=email,
            expires_delta=datetime.timedelta(days=1)
        )
        return jsonify({
            "message": "Connexion reussie",
            "access_token": access_token
        }), 200
    else:
        return jsonify({"error": "Mot de passe incorrect"}), 401


if __name__ == "__main__":
    app.run(debug=True)
