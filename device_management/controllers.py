from flask import Blueprint, request, jsonify
from business import DeviceBusiness
from flask_jwt_extended import jwt_required

device_bp = Blueprint('device_bp', __name__)

@device_bp.route('/devices', methods=['GET', 'POST'])
#@jwt_required()
def manage_devices():
    if request.method == 'GET':
        return DeviceBusiness.list_devices()
    elif request.method == 'POST':
        return DeviceBusiness.create_device(request)

@device_bp.route('/devices/<int:device_id>', methods=['PUT', 'DELETE'])
#@jwt_required()
def device_detail(device_id):
    if request.method == 'PUT':
        return DeviceBusiness.update_device(device_id, request)
    elif request.method == 'DELETE':
        return DeviceBusiness.delete_device(device_id)
@device_bp.route('/devices/search', methods=['GET'])
def search_devices():
    # Récupère le paramètre 'q' depuis la query string (exemple: /devices/search?q=imprimante)
    query = request.args.get('q', '')
    return DeviceBusiness.search_devices(query)
