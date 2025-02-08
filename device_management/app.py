from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from controllers import device_bp
from business import DeviceBusiness
from flask import request
from models import db

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=["http://localhost:3000"])

db.init_app(app)

jwt = JWTManager(app)
@app.route('/')
def home():
    return "Bienvenue sur l'application Device Management !"
app.register_blueprint(device_bp)

@app.route('/devices/search', methods=['GET'])
def search_devices():
    query = request.args.get('q', '')
    if query:
        return DeviceBusiness.search_devices(query)
    return jsonify({'devices': []})

if __name__ == '__main__':
    app.run(debug=True)
