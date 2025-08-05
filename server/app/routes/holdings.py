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
        """Returns all holdings for a specific portfolio. Merged by asset with batch price fetching."""
        try:
            holdings = Holding.query.options(joinedload(Holding.asset)).filter_by(portfolio_id=portfolio_id).all()
            
            if not holdings:
                return {}, 200
            
            # Get unique symbols for batch price fetching
            symbols = list(set(h.asset.symbol for h in holdings))
            
            # Batch fetch latest prices for all symbols at once
            from ..services.asset_service import fetch_latest_prices
            price_data = fetch_latest_prices(symbols)
            
            merged_holdings = {}
            for h in holdings:
                symbol = h.asset.symbol
                if symbol not in merged_holdings:
                    # Get price from batch data or fallback to stored price
                    current_price = None
                    if symbol in price_data:
                        current_price = price_data[symbol].get('price')
                    
                    # Fallback to stored asset price if batch fetch failed
                    if current_price is None:
                        current_price = h.asset.current_price if hasattr(h.asset, 'current_price') else 100.0
                    
                    merged_holdings[symbol] = {
                        'quantity': h.quantity,
                        'current_price': current_price,
                        'asset_name': h.asset.name,
                        'asset_symbol': h.asset.symbol,
                        'asset_id': h.asset.id,
                        'asset_type': h.asset.asset_type,
                        'asset_sector': h.asset.sector,
                        'asset_dayChangeP': price_data.get(symbol, {}).get('day_changeP') if symbol in price_data else None,
                        'purchase_price': h.purchase_price,
                        'return': 'TODO'
                    }
                else:
                    merged_holdings[symbol]['quantity'] += h.quantity
                    # Weight average purchase price when merging
                    total_qty = merged_holdings[symbol]['quantity']
                    merged_holdings[symbol]['purchase_price'] = (
                        (merged_holdings[symbol]['purchase_price'] * (total_qty - h.quantity) + 
                         h.purchase_price * h.quantity) / total_qty
                    )
            
            return merged_holdings, 200

        except SQLAlchemyError as e:
            print(f"Error fetching holdings: {e}")
            return {"error": str(e)}, 500