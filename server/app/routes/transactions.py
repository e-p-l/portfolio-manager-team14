from .. import db
from ..models.transaction import Transaction
from ..models.asset import Asset
from ..models.holding import Holding
from ..services.asset_service import fetch_latest_prices, fetch_latest_price, update_asset_history
from ..services.holding_service import buy_asset, sell_asset

from flask import request
from sqlalchemy.exc import SQLAlchemyError
from flask_restx import Namespace, Resource, fields
from datetime import datetime, timezone, date

api_ns = Namespace('transactions', description='Transaction operations')
transaction_input_models = {
    'create' : api_ns.model('Transaction', {
        'portfolio_id': fields.Integer(required=True),
        'asset_id': fields.Integer(required=False),
        'quantity': fields.Float(required=True),
        'transaction_type': fields.String(required=True)
    }),
    'update': api_ns.model('TransactionUpdate', {
        'quantity': fields.Float(required=False),
        'price': fields.Float(required=False),
        'transaction_type': fields.String(required=False)
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
        Buys or sell an asset.
        Expects JSON with portfolio_id, asset_id, quantity, transaction_type.
        """
        data = request.get_json()

        required_fields = ['portfolio_id', 'asset_id', 'quantity', 'transaction_type']

        if not all(field in data for field in required_fields):
            return {"error": "Missing required fields"}, 400
        
        try:
            latest_price = fetch_latest_price(data['asset_id'])
            update_asset_history(data['asset_id'], latest_price, date.today())
        
            if data['transaction_type'].lower() == 'sell':
                transactions = sell_asset(data['portfolio_id'],data['asset_id'], data['quantity'], latest_price)
            else:
                transactions = [buy_asset(data['portfolio_id'], data['asset_id'], data['quantity'], latest_price)]
            
            return [t.serialize() for t in transactions], 201

        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

@api_ns.route('/portfolio/<int:portfolio_id>')
class PortfolioTransactionsResource(Resource):
    def get(self, portfolio_id):
        """Returns a list of all transactions for a specific portfolio."""
        try:
            transactions = Transaction.query.filter_by(portfolio_id=portfolio_id).order_by(Transaction.created_at.desc()).all()
            return [t.serialize() for t in transactions], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500