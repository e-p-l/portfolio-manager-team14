from .. import db
from . import api_bp
from ..models.holding import Holding

from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError

@api_bp.route("/holdings", methods=['GET'])
def get_holdings():
    """
    Returns a list of all holdings in the database.
    """
    holdings = Holding.query.all()
    return jsonify([h.serialize() for h in holdings])

@api_bp.route("/holdings/<int:holding_id>", methods=['GET'])
def get_holding(holding_id: int):
    """
    Returns a specific holding by its ID.
    """
    holding = Holding.query.get(holding_id)
    if holding:
        return jsonify(holding.serialize())
    else:
        return jsonify({"error": "Holding not found"}), 404
    
@api_bp.route("/holdings", methods=['POST'])
def create_holding():
    """
    Creates a new holding.
    Expects JSON with portfolio_id, asset_id, quantity, and purchase_price.
    """
    data = request.get_json()
    if not data or 'portfolio_id' not in data or 'asset_id' not in data or 'quantity' not in data or 'purchase_price' not in data:
        return jsonify({"error": "Invalid input"}), 400

    try:
        new_holding = Holding(
            portfolio_id=data['portfolio_id'],
            asset_id=data['asset_id'],
            quantity=data['quantity'],
            purchase_price=data['purchase_price']
        )
        
        db.session.add(new_holding)
        db.session.commit()
        
        return jsonify(new_holding.serialize()), 201
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route("/holdings/<int: holding_id>", methods=['PUT'])
def update_holding(holding_id: int):
    """
    Updates an existing holding.
    Expects JSON with optional fields: quantity and purchase_price.
    """
    data = request.get_json()

    holding = Holding.query.get(holding_id)
    if not holding:
        return jsonify({"error": "Holding not found"}), 404

    try:    
        if 'quantity' in data:
            holding.quantity = data['quantity']
        
        if 'purchase_price' in data:
            holding.purchase_price = data['purchase_price']
        
        db.session.commit()
        return jsonify(holding.serialize())
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route("/holdings/<int:holding_id>", methods=['DELETE'])
def delete_holding(holding_id: int):
    """
    Deletes a specific holding by its ID.
    """
    holding = Holding.query.get(holding_id)
    if not holding:
        return jsonify({"error": "Holding not found"}), 404

    try:
        db.session.delete(holding)
        db.session.commit()
        return jsonify({"message": "Holding deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
