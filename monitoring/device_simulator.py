import pika
import json
import time
import random
from datetime import datetime
import os

def simulate_device_data():
    rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
    connection = pika.BlockingConnection(pika.ConnectionParameters(rabbitmq_host))
    channel = connection.channel()
    channel.queue_declare(queue='device_events')

    device_ids = ['device1', 'device2', 'device3']
    event_types = ['temperature', 'humidity', 'pressure']

    while True:
        for device_id in device_ids:
            # Alterner le statut toutes les 3 itérations
            current_time = datetime.now()
            is_active = (int(current_time.timestamp()) // 6) % 2 == 0
            
            data = {
                'device_id': device_id,
                'type': random.choice(event_types),
                'value': random.uniform(20, 30),
                'timestamp': current_time.strftime('%Y-%m-%dT%H:%M:%S.%f'),
                'status': 'active' if is_active else 'inactive'
            }

            channel.basic_publish(
                exchange='',
                routing_key='device_events',
                body=json.dumps(data)
            )
            print(f"From AMJAHID: {data}")
            time.sleep(2)

if __name__ == '__main__':
    try:
        simulate_device_data()
    except KeyboardInterrupt:
        print("Simulation arrêtée")
