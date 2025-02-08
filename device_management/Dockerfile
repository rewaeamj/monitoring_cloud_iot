FROM python:3.10-slim

WORKDIR /app

# Copier le fichier requirements.txt
COPY requirements.txt . 

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Définir la variable d'environnement FLASK_APP
ENV FLASK_APP=app.py

# Exposer le port utilisé par Flask
EXPOSE 5000

# Démarrer l'application Flask
CMD ["flask", "run", "--host=0.0.0.0"]
