from .. import db
from ..models.transaction import Transaction
from ..models.asset import Asset
from ..models.holding import Holding
from ..services.asset_service import fetch_latest_prices

from flask import request
from sqlalchemy.exc import SQLAlchemyError
from flask_restx import Namespace, Resource, fields
from datetime import datetime

api_ns = Namespace('transactions', description='Transaction operations')
transaction_input_models = {
    'create' : api_ns.model('Transaction', {
        'portfolio_id': fields.Integer(required=True),
        'holding_id': fields.Integer(required=True),
        'quantity': fields.Float(required=True),
        'price': fields.Float(required=True),
        'created_at': fields.DateTime(required=True),
        'transaction_type': fields.String(required=True)
    }),
    'update' : api_ns.model('Transaction', {
        'quantity': fields.Float(required=True),
        'price': fields.Float(required=True),
        'transaction_type': fields.String(required=True)
    })
}

@api_ns.route('/')
class TransactionListResource(Resource):
    def get(self):
        """Returns a list of all transactions in the database."""
        try:
            transactions = Transaction.query.all()
            return [t.serialize() for t in transactions], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @api_ns.expect(transaction_input_models['create'])
    def post(self):
        """
        Creates a new transaction.
        Expects JSON with portfolio_id, asset_id (buy), holding_id (sell), quantity, transaction_type.
        """
        data = request.get_json()

        required_fields = {
            'buy': ['portfolio_id', 'asset_id', 'quantity', 'transaction_type'],
            'sell': ['portfolio_id', 'holding_id', 'quantity', 'transaction_type']
        }

        if not all(field in data for field in required_fields[data['transaction_type'].lower()]):
            return {"error": "Missing required fields"}, 400

        asset = Asset.query.get(data['asset_id'])
        if not asset:
            return {"error": "Asset not found"}, 404

        try:
            latest_prices = fetch_latest_prices([asset.symbol])
            if asset.symbol not in latest_prices:
                return {"error": f"No live data found for {asset.symbol}"}, 500

            if data['transaction_type'].lower() == 'buy':
                holding = Holding(
                    portfolio_id=data['portfolio_id'],
                    asset_id=data['asset_id'],
                    quantity=data['quantity'],
                    purchase_price=latest_prices[asset.symbol]['price'],
                    purchase_date= datetime.utcnow()
                )
                db.session.add(holding)
                db.session.commit()

            elif data['transaction_type'].lower() == 'sell':
                holding = Holding.query.filter_by(portfolio_id=data['portfolio_id'], asset_id=data['asset_id']).first()
                if not holding or holding.quantity < data['quantity']:
                    return {"error": "Insufficient holdings to sell"}, 400
                holding.quantity -= data['quantity']
                db.session.commit()

            else:
                return {"error": "Invalid transaction type"}, 400

            # Create transaction
            transaction = Transaction(
                portfolio_id=data['portfolio_id'],
                holding_id=holding.id,
                quantity=data['quantity'],
                price=latest_prices[asset.symbol]['price'],
                created_at=datetime.utcnow(),
                transaction_type=data['transaction_type'].lower()
            )
            db.session.add(transaction)
            db.session.commit()

            return transaction.serialize(), 201

        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

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

    @api_ns.expect(transaction_input_models['update'])
    def put(self, transaction_id):
        """
        Updates an existing transaction.
        Expects JSON with any of: quantity, price, transaction_type.
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
        
