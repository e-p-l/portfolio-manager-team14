from .. import db
from ..models.holding import Holding
from ..services.asset_service import fetch_latest_price

from flask import request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from flask_restx import Namespace, Resource, fields

api_ns = Namespace('holdings', description='Holding operations')
holding_model = api_ns.model('Holding', {
    'portfolio_id': fields.Integer(required=True),
    'asset_id': fields.Integer(required=True),
    'quantity': fields.Float(required=True),
    'purchase_price': fields.Float(required=True),
    'purchase_date': fields.DateTime(required=True)
})

@api_ns.route('/')
class HoldingListResource(Resource):
    def get(self):
        """Returns a list of all holdings in the database."""
        try:
            holdings = Holding.query.all()
            return [h.serialize() for h in holdings], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

@api_ns.route('/<int:holding_id>')
class HoldingResource(Resource):
    def get(self, holding_id):
        """Returns a specific holding by its ID."""
        try:
            holding = Holding.query.get(holding_id)
            if holding:
                return holding.serialize(), 200
            else:
                return {"error": "Holding not found"}, 404
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    def delete(self, holding_id):
        """Deletes a specific holding by its ID."""
        print(f"Received DELETE request for holding {holding_id}")
        
        holding = Holding.query.get(holding_id)
        if not holding:
            return {"error": "Holding not found"}, 404

        try:
            db.session.delete(holding)
            db.session.commit()
            return {"message": "Holding deleted successfully"}, 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500
        
@api_ns.route('/portfolio/<int:portfolio_id>')
class HoldingsByPortfolioResource(Resource):
    def get(self, portfolio_id):
        """Returns all holdings for a specific portfolio. Merged by asset."""
        try:
            holdings = Holding.query.options(joinedload(Holding.asset)).filter_by(portfolio_id=portfolio_id).all()
            merged_holdings = {}
            for h in holdings:
                if h.asset.symbol not in merged_holdings:
                    merged_holdings[h.asset.symbol] = {
                        'quantity': h.quantity,
                        'current_price': fetch_latest_price(h.asset.id),
                        'holdings_id': [h.id],
                        'return': 'TODO'
                    }
                else:
                    merged_holdings[h.asset.symbol]['quantity'] += h.quantity
                    merged_holdings[h.asset.symbol]['holdings_id'].append(h.id)
                    # TODO: Handle other fields like purchase_price
            
            return merged_holdings, 200

        except SQLAlchemyError as e:
            return {"error": str(e)}, 500