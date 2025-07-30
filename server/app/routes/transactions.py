from .. import db
from ..models.transaction import Transaction

from flask import request
from sqlalchemy.exc import SQLAlchemyError
from flask_restx import Namespace, Resource, fields
from datetime import datetime

api_ns = Namespace('transactions', description='Transaction operations')
transaction_model = api_ns.model('Transaction', {
    'portfolio_id': fields.Integer(required=True),
    'holding_id': fields.Integer(required=True),
    'quantity': fields.Float(required=True),
    'price': fields.Float(required=True),
    'created_at': fields.DateTime(required=True),
    'transaction_type': fields.String(required=True)
})

@api_ns.route('/')
class TransactionListResource(Resource):
    def get(self):
        """Returns a list of all transactions in the database."""
        try:
            transactions = Transaction.query.all()
            return [t.serialize() for t in transactions], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @api_ns.expect(transaction_model)
    def post(self):
        """
        Creates a new transaction.
        Expects JSON with portfolio_id, holding_id, quantity, price, created_at, transaction_type.
        """
        data = request.get_json()
        if (
            not data or
            'portfolio_id' not in data or
            'holding_id' not in data or
            'quantity' not in data or
            'price' not in data or
            'created_at' not in data or
            'transaction_type' not in data
        ):
            return {"error": "No input data provided"}, 400

        try:
            transaction = Transaction(
                portfolio_id=data['portfolio_id'],
                holding_id=data['holding_id'],
                quantity=data['quantity'],
                price=data['price'],
                created_at=datetime.strptime(data['created_at'], '%Y-%m-%d') if isinstance(data['created_at'], str) else data['created_at'],
                transaction_type=data.get('transaction_type', None)
            )
            db.session.add(transaction)
            db.session.commit()
            return transaction.serialize(), 201
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500
        except ValueError as e:
            return {"error": "Invalid date format"}, 400

@api_ns.route('/<int:transaction_id>')
class TransactionResource(Resource):
    def get(self, transaction_id):
        """Returns a specific transaction by its ID."""
        try:
            transaction = Transaction.query.get(transaction_id)
            if transaction:
                return transaction.serialize(), 200
            else:
                return {"error": "Transaction not found"}, 404
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @api_ns.expect(transaction_model)
    def put(self, transaction_id):
        """
        Updates an existing transaction.
        Expects JSON with any of: quantity, price, created_at, transaction_type.
        """
        data = request.get_json()
        transaction = Transaction.query.get(transaction_id)

        if not transaction:
            return {"error": "Transaction not found"}, 404

        try:
            if 'quantity' in data:
                transaction.quantity = data['quantity']
            if 'price' in data:
                transaction.price = data['price']
            if 'created_at' in data:
                transaction.created_at = datetime.strptime(data['created_at'], '%Y-%m-%d')
            if 'transaction_type' in data:
                transaction.transaction_type = data['transaction_type']

            db.session.commit()
            return transaction.serialize(), 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500
        except ValueError as e:
            return {"error": "Invalid date format"}, 400

    def delete(self, transaction_id):
        """Deletes a specific transaction by its ID."""
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return {"error": "Transaction not found"}, 404

        try:
            db.session.delete(transaction)
            db.session.commit()
            return {"message": "Transaction deleted successfully"}, 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500