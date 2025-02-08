import json
from dal import DeviceDAL
from flask import jsonify
import pika
from config import Config

class DeviceBusiness:
    @staticmethod
    def publish_event(event_data):
        """
        Publishes an event to RabbitMQ.
        """
        try:
            # Vérification si event_data est bien un dictionnaire
            if not isinstance(event_data, dict):
                raise ValueError("Les donnees de l'événement doivent être un dictionnaire.")

            # Sérialisation des données en JSON
            event_data_str = json.dumps(event_data)

            # Connexion à RabbitMQ
            parameters = pika.URLParameters(Config.RABBITMQ_URL)
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            channel.queue_declare(queue='device_events', durable=True)
            channel.basic_publish(
                exchange='',
                routing_key='device_events',
                body=event_data_str,  # Publier la chaîne JSON
                properties=pika.BasicProperties(delivery_mode=2)  # Assurez-vous que le message est persistant
            )
            connection.close()
        except Exception as e:
            # Retourner une erreur en cas de problème avec RabbitMQ ou les données
            return jsonify({"error": f"RabbitMQ Error: {str(e)}"}), 500

    @staticmethod
    def list_devices():
        try:
            devices = DeviceDAL.get_all_devices()
            print(f"Devices fetched: {devices}")  # Log de la liste des dispositifs
            return jsonify({'devices': devices}), 200
        except Exception as e:
            print(f"Error: {str(e)}")
            return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500
        
    @staticmethod
    def create_device(request):
        data = request.get_json()
        if not data.get('name'):
            return jsonify({"error": "Le nom est requis"}), 400

        device_id = DeviceDAL.insert_device(data)
        if device_id:
            event_data = {'event': 'device_created', 'device_id': device_id, 'name': data['name']}
            print("Donnees de l'evenement:", event_data)
            DeviceBusiness.publish_event(event_data)
            return jsonify({"message": "Dispositif cree", "id": device_id}), 201
        return jsonify({"error": "Erreur lors de la creation"}), 500

    @staticmethod
    def update_device(device_id, request):
        data = request.get_json()
        if DeviceDAL.update_device(device_id, data):
            event_data = {'event': 'device_updated', 'device_id': device_id}
            DeviceBusiness.publish_event(event_data)
            return jsonify({"message": "Dispositif mis a jour"}), 200
        return jsonify({"error": "Erreur lors de la mise a jour"}), 500

    @staticmethod
    def delete_device(device_id):
        if DeviceDAL.delete_device(device_id):
            event_data = {'event': 'device_deleted', 'device_id': device_id}
            DeviceBusiness.publish_event(event_data)
            return jsonify({"message": "Dispositif supprime"}), 200
        return jsonify({"error": "Erreur lors de la suppression"}), 500
    @staticmethod
    def search_devices(query):
        try:
            devices = DeviceDAL.search_devices(query)
            # Retourne toujours un JSON avec la clé 'devices'
            return jsonify({'devices': devices}), 200
        except Exception as e:
            print(f"Erreur lors de la recherche: {str(e)}")
            return jsonify({"error": f"Erreur lors de la recherche: {str(e)}"}), 500
