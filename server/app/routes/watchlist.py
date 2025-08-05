from .. import db
from ..models.watchlist import Watchlist
from ..models.asset import Asset
from ..services.watchlist_service import (
    add_to_watchlist,
    remove_from_watchlist,
    remove_from_watchlist_by_asset,
    get_watchlist_by_portfolio,
    update_watchlist_notes
)
from ..services.asset_service import fetch_latest_prices

from flask import request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from flask_restx import Namespace, Resource, fields

api_ns = Namespace('watchlist', description='Watchlist operations')

watchlist_input_models = {
    'create': api_ns.model('WatchlistCreate', {
        'asset_id': fields.Integer(required=True),
        'notes': fields.String(required=False)
    }),
    'update': api_ns.model('WatchlistUpdate', {
        'notes': fields.String(required=False)
    })
}

@api_ns.route('/')
class WatchlistListResource(Resource):
    def get(self):
        """Returns a list of all watchlist items in the database."""
        try:
            watchlist_items = Watchlist.query.options(joinedload(Watchlist.asset)).all()
            return [item.serialize() for item in watchlist_items], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500


@api_ns.route('/portfolio/<int:portfolio_id>')
class WatchlistByPortfolioResource(Resource):
    def get(self, portfolio_id):
        """Returns all watchlist items for a specific portfolio with current prices."""
        try:
            watchlist_items = Watchlist.query.options(joinedload(Watchlist.asset)).filter_by(portfolio_id=portfolio_id).all()
            
            if not watchlist_items:
                return [], 200
            
            # Get unique symbols for batch price fetching
            symbols = list(set(item.asset.symbol for item in watchlist_items if item.asset))
            
            # Batch fetch latest prices for all symbols at once
            price_data = fetch_latest_prices(symbols) if symbols else {}
            
            # Enhance watchlist items with current price data
            enhanced_items = []
            for item in watchlist_items:
                item_data = item.serialize()
                if item.asset and item.asset.symbol in price_data:
                    price_info = price_data[item.asset.symbol]
                    item_data['current_price'] = price_info.get('price')
                    item_data['day_change'] = price_info.get('day_change')
                    item_data['day_changeP'] = price_info.get('day_changeP')
                enhanced_items.append(item_data)
            
            return enhanced_items, 200

        except ValueError as e:
            return {"error": str(e)}, 404
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @api_ns.expect(watchlist_input_models['create'])
    def post(self, portfolio_id):
        """Adds an asset to the portfolio's watchlist."""
        data = request.get_json()
        if not data or 'asset_id' not in data:
            return {"error": "Invalid input. 'asset_id' is required."}, 400

        try:
            watchlist_item = add_to_watchlist(
                portfolio_id=portfolio_id,
                asset_id=data['asset_id'],
                notes=data.get('notes')
            )
            return watchlist_item.serialize(), 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

@api_ns.route('/portfolio/<int:portfolio_id>/asset/<int:asset_id>')
class WatchlistByPortfolioAssetResource(Resource):
    def delete(self, portfolio_id, asset_id):
        """Removes a specific asset from the portfolio's watchlist."""
        try:
            remove_from_watchlist_by_asset(portfolio_id, asset_id)
            return {"message": "Asset removed from watchlist successfully"}, 200
        except ValueError as e:
            return {"error": str(e)}, 404
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500
