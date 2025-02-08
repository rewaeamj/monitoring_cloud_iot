import os

class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:password@localhost:5432/db_auth"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "1234"
