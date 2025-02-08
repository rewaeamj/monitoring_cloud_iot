# Monitoring Cloud IoT  

## 📝 Description du projet  
Monitoring Cloud IoT est un projet basé sur une **architecture microservices** qui permet la **gestion et la surveillance des dispositifs IoT** à l'aide de Flask, PostgreSQL, MongoDB, Redis, RabbitMQ et Kubernetes.  

## 🚀 **Architecture du Projet**  
Le projet est composé de **trois microservices principaux** :  

1. **Signing Microservice** 🛂  
   - Gère l'authentification et l'autorisation des utilisateurs.  
   - 📌 Technologies : Flask, PostgreSQL, Redis.  

2. **Device Management Microservice** 📟  
   - Assure l'enregistrement, la configuration et le suivi des dispositifs IoT.  
   - 📌 Technologies : Flask, PostgreSQL, Redis.  

3. **Monitoring Microservice** 📊  
   - Collecte et visualise les données des dispositifs IoT en temps réel.  
   - 📌 Technologies : Flask, MongoDB, Socket.IO.  

Le projet est orchestré avec **Kubernetes** et utilise **RabbitMQ** pour la communication entre microservices.  

## 🔄 **Flux de données**  
1. Les dispositifs IoT envoient leurs données au **microservice Device Management**.  
2. Ce dernier transmet les événements pertinents au **microservice Monitoring** via **RabbitMQ**.  
3. Le **microservice Monitoring** stocke ces données dans **MongoDB** et fournit des mises à jour en temps réel via **Socket.IO**.  

## ⚙️ **Technologies utilisées**  
- **Back-end :** Flask, Python  
- **Base de données :** PostgreSQL (Signing & Device Management), MongoDB (Monitoring), Redis (Caching)  
- **Communication :** HTTP REST, RabbitMQ (message broker), Socket.IO (temps réel)  
- **Orchestration :** Kubernetes (MicroK8s)  
- **Conteneurisation :** Docker  
- **API Gateway :** NGINX  


