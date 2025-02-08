from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import pika
import json
import threading
from pymongo import MongoClient
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Utiliser les variables d'environnement
mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')

client = MongoClient(mongodb_uri)
db = client.iot_monitoring
device_data = db.device_data

def setup_rabbitmq():
    connection = pika.BlockingConnection(pika.ConnectionParameters(rabbitmq_host))
    channel = connection.channel()
    channel.queue_declare(queue='device_events', durable=False)
    return channel

def callback(ch, method, properties, body):
    try:
        data = json.loads(body)
        device_data.insert_one(data)
        socketio.emit('device_update', data)
    except Exception as e:
        print(f"Erreur de traitement du message: {e}")

@app.route('/monitoring/history/<device_id>', methods=['GET'])
def get_device_history(device_id):
    try:
        history = list(device_data.find({'device_id': device_id}, {'_id': 0}))
        return jsonify({'history': history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route pour obtenir les statistiques
@app.route('/monitoring/stats', methods=['GET'])
def get_stats():
    try:
        # Obtenir tous les appareils uniques
        all_devices = device_data.distinct('device_id')
        
        # Calculer le nombre d'appareils actifs (dernière activité < 5 minutes)
        five_minutes_ago = datetime.now()
        
        active_devices = []
        for device_id in all_devices:
            # Obtenir le dernier événement pour chaque appareil
            last_event = device_data.find_one(
                {'device_id': device_id},
                sort=[('timestamp', -1)]
            )
            
            if last_event:
                try:
                    # Essayer de parser le timestamp de différentes manières
                    try:
                        event_time = datetime.fromisoformat(last_event['timestamp'].replace('Z', '+00:00'))
                    except:
                        event_time = datetime.strptime(last_event['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')
                        
                    if last_event['status'] == 'active' and (five_minutes_ago - event_time).total_seconds() < 300:
                        active_devices.append(device_id)
                except Exception as e:
                    print(f"Erreur de parsing pour le timestamp: {e}")
                    continue

        stats = {
            'total_devices': len(all_devices),
            'total_events': device_data.count_documents({}),
            'active_devices': len(active_devices)
        }
        return jsonify(stats)
    except Exception as e:
        print(f"Erreur dans get_stats: {e}")
        return jsonify({'error': str(e)}), 500

def start_rabbitmq_consumer():
    channel = setup_rabbitmq()
    channel.basic_consume(
        queue='device_events',
        on_message_callback=callback,
        auto_ack=True
    )
    channel.start_consuming()

if __name__ == '__main__':
    consumer_thread = threading.Thread(target=start_rabbitmq_consumer)
    consumer_thread.daemon = True
    consumer_thread.start()
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5002) 