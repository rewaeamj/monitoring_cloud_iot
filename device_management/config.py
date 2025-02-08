import os

class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:1234@localhost:5432/db_devices"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost/')
