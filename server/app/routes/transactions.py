from .. import db
from . import api_bp
from ..models.transaction import Transaction

from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

@api_bp.route("/transactions", methods=['GET'])
def get_transactions():
    """
    Returns a list of all transactions in the database.
    """
    transactions = Transaction.query.all()
    return jsonify([t.serialize() for t in transactions])

@api_bp.route("/transactions/<int:transaction_id>", methods=['GET'])
def get_transaction(transaction_id: int):
    """
    Returns a specific transaction by its ID.
    """
    transaction = Transaction.query.get(transaction_id)
    if transaction:
        return jsonify(transaction.serialize())
    else:
        return jsonify({"error": "Transaction not found"}), 404

@api_bp.route("/transactions", methods=['POST'])
def create_transaction():
    """
    Creates a new transaction.
    """
    data = request.get_json()
    if not data or 'portfolio_id' not in data or 'asset_id' not in data or 'quantity' not in data or 'price' not in data or 'created_at' not in data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        transaction = Transaction(portfolio_id=data['portfolio_id'],
                                  asset_id=data['asset_id'],
                                  quantity=data['quantity'],
                                  price=data['price'],
                                  created_at=datetime.strptime(data['created_at'], '%Y-%m-%d'),
                                  transaction_type=data.get('transaction_type', None),
                                  fee=data.get('fee', None),
                                  tax=data.get('tax', None),
                                  currency=data.get('currency', None))
        db.session.add(transaction)
        db.session.commit()
        return jsonify(transaction.serialize()), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    except ValueError as e:
        return jsonify({"error": "Invalid date format"}), 400

@api_bp.route("/transactions/<int:transaction_id>", methods=['PUT'])
def update_transaction(transaction_id: int):
    """
    Updates an existing transaction.
    """
    data = request.get_json()
    transaction = Transaction.query.get(transaction_id)

    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    try:
        if 'quantity' in data:
            transaction.quantity = data['quantity']
        if 'price' in data:
            transaction.price = data['price']
        if 'created_at' in data:
            transaction.created_at = datetime.strptime(data['created_at'], '%Y-%m-%d')
        if 'transaction_type' in data:
            transaction.transaction_type = data['transaction_type']
        if 'fee' in data:
            transaction.fee = data['fee']
        if 'tax' in data:
            transaction.tax = data['tax']
        if 'currency' in data:
            transaction.currency = data['currency']

        db.session.commit()
        return jsonify(transaction.serialize())

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    except ValueError as e:
        return jsonify({"error": "Invalid date format"}), 400

@api_bp.route("/transactions/<int:transaction_id>", methods=['DELETE'])
def delete_transaction(transaction_id: int):
    """
    Deletes a specific transaction by its ID.
    """
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    try:
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({"message": "Transaction deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500