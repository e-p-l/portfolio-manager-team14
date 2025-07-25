from . import api_bp
from ..models.asset import Asset
from .. import db

from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError

@api_bp.route('/assets', methods=['GET'])
def get_all_assets():
    """
    Returns a list of all assets in the database.
    """
    try:
        assets = Asset.query.all()
        return jsonify([asset.serialize() for asset in assets])

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/assets/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    """
    Returns a specific asset by its ID.
    """
    try:
        asset = Asset.query.get(asset_id)
        
        if asset:
            return jsonify(asset.serialize())
        else:
            return jsonify({"error": "Asset not found"}), 404

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/assets', methods=['POST'])
def create_asset():
    """
    Creates a new asset in the database.
    Expects JSON data with 'symbol', 'name', 'asset_type', 'exchange', 'sector' and 'current_price'
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        new_asset = Asset(
            symbol=data['symbol'],
            name=data['name'],
            asset_type=data.get('asset_type', None),
            exchange=data.get('exchange', None),
            sector=data.get('sector', None),
            current_price=data.get('current_price', None)
        )
        db.session.add(new_asset)
        db.session.commit()
        return jsonify(new_asset.serialize()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route('/assets/<int:asset_id>', methods=['PUT'])
def update_asset(asset_id):
    """
    Updates an existing asset in the database.
    Expects JSON data with 'symbol', 'name', 'asset_type', 'exchange', and 'sector'.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        asset = Asset.query.get(asset_id)
        if asset:
            if 'symbol' in data:
                asset.symbol = data['symbol']
            if 'name' in data:
                asset.name = data['name']
            if 'asset_type' in data:
                asset.asset_type = data['asset_type']
            if 'exchange' in data:
                asset.exchange = data['exchange']
            if 'sector' in data:
                asset.sector = data['sector']
            if 'current_price' in data:
                asset.current_price = data['current_price']

            db.session.commit()
            return jsonify(asset.serialize())
        else:
            return jsonify({"error": "Asset not found"}), 404

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route('/assets/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    """
    Deletes an asset from the database by its ID.
    """
    try:
        asset = Asset.query.get(asset_id)
        if asset:
            db.session.delete(asset)
            db.session.commit()
            return jsonify({"message": "Asset deleted successfully"}), 200
        else:
            return jsonify({"error": "Asset not found"}), 404

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500