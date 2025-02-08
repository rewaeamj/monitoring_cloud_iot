import psycopg2
import os
import json
from models import Device
from models import db
def get_db_connection():
    try:
        return psycopg2.connect(
            database=os.getenv('DEVICE_DB', 'db_devices'),
            user=os.getenv('DEVICE_DB_USER', 'postgres'),
            password=os.getenv('DEVICE_DB_PASSWORD', '1234'),
            host=os.getenv('DEVICE_DB_HOST', 'localhost'),
            port=os.getenv('DEVICE_DB_PORT', '5432')
        )
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        raise  

class DeviceDAL:
    @staticmethod
    def get_all_devices():
        devices = []
        try:
            print("Connecting to the database...")
            conn = get_db_connection()
            cur = conn.cursor()
            
            print("Executing query...")
            # On récupère uniquement id, name, description, status
            cur.execute("SELECT id, name, description, status FROM devices")
            rows = cur.fetchall()
            print(f"Number of rows fetched: {len(rows)}")
            
            for row in rows:
                device = {
                    'id': row[0],
                    'name': row[1],
                    'description': row[2] if row[2] else '',
                    'status': row[3] if row[3] else 'inactive'
                }
                devices.append(device)
            
            cur.close()
            conn.close()
            return devices
            
        except Exception as e:
            print(f"Database error: {str(e)}")
            raise
    @staticmethod
    def insert_device(data):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO devices (name, description, status ) VALUES (%s, %s, %s) RETURNING id",
            (data['name'], data.get('description', ''), data.get('status', 'inactive'))
        )
        device_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return device_id

    @staticmethod
    def update_device(device_id, data):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE devices SET name = %s, description = %s, status = %s  WHERE id = %s",
            (data.get('name'), data.get('description'), data.get('status'), device_id)
        )
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def delete_device(device_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM devices WHERE id = %s", (device_id,))
        conn.commit()
        conn.close()
        return True
    

    @staticmethod
    def search_devices(query):
        devices = []
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            search_pattern = f"%{query}%"
            cur.execute("""
                SELECT id, name, description, status 
                FROM devices 
                WHERE name ILIKE %s OR description ILIKE %s
            """, (search_pattern, search_pattern))
            rows = cur.fetchall()
            
            for row in rows:
                device = {
                    'id': row[0],
                    'name': row[1],
                    'description': row[2] if row[2] else '',
                    'status': row[3] if row[3] else 'inactive'
                }
                devices.append(device)
            
            cur.close()
            conn.close()
            return devices
        except Exception as e:
            print(f"Database error: {str(e)}")
            raise