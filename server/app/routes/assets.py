from ..models.asset import Asset
from ..services.asset_service import fetch_asset_metadata, fetch_latest_prices, search_assets, get_asset_info
from .. import db

from flask import request
from sqlalchemy.exc import SQLAlchemyError
from flask_restx import Namespace, Resource, fields


api_ns = Namespace('assets', description='Asset operations')

asset_input_models = {
    'create': api_ns.model('Asset', {
        'symbol': fields.String(required=True),
        'name': fields.String(required=True),
    }),
    'update' : api_ns.model('Asset', {
        'symbol': fields.String(required=False),
        'name': fields.String(required=False),
        'asset_type': fields.String(required=False),
        'sector': fields.String(required=False),
    })
}

@api_ns.route('/')
class AssetListResource(Resource):
    def get(self):
        """Returns a list of all assets in the database."""
        try:
            assets = Asset.query.all()
            return [asset.serialize() for asset in assets], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @api_ns.expect(asset_input_models['create'])
    def post(self):
        """
        Creates a new asset in the database.
        Expects JSON data with 'symbol' and 'name'.
        Automatically uppercases the symbol 
        and fetches full info from yfinance.
        """
        data = request.get_json()
        if not data or 'symbol' not in data or 'name' not in data:
            return {"error": "Missing required fields"}, 400

        symbol = data['symbol'].upper()

        try:
            existing = Asset.query.filter_by(symbol=symbol).first()
            if existing:
                return {"message": "Asset already exists"}, 400

            info = get_asset_info(symbol)

            new_asset = Asset(
                symbol=symbol,
                name=info['name'],
                asset_type=info['asset_type'],
                sector=info['sector'],
                day_changeP=info['day_changeP']
            )
            db.session.add(new_asset)
            db.session.commit()
            return new_asset.serialize(), 201

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

@api_ns.route('/<int:asset_id>')
class AssetResource(Resource):
    def get(self, asset_id):
        """Returns a specific asset by its ID."""
        try:
            asset = Asset.query.get(asset_id)
            if asset:
                return asset.serialize(), 200
            else:
                return {"error": "Asset not found"}, 404
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @api_ns.expect(asset_input_models['update'])
    def put(self, asset_id):
        """
        Updates an existing asset in the database.
        Expects JSON data with 'symbol', 'name', 'asset_type', and 'sector'.
        """
        data = request.get_json()
        if not data:
            return {"error": "No input data provided"}, 400

        try:
            asset = Asset.query.get(asset_id)
            if asset:
                if 'symbol' in data:
                    asset.symbol = data['symbol']
                if 'name' in data:
                    asset.name = data['name']
                if 'asset_type' in data:
                    asset.asset_type = data['asset_type']
                if 'sector' in data:
                    asset.sector = data['sector']

                db.session.commit()
                return asset.serialize(), 200
            else:
                return {"error": "Asset not found"}, 404
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    def delete(self, asset_id):
        """Deletes an asset from the database by its ID."""
        try:
            asset = Asset.query.get(asset_id)
            if asset:
                db.session.delete(asset)
                db.session.commit()
                return {"message": "Asset deleted successfully"}, 200
            else:
                return {"error": "Asset not found"}, 404
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)},

@api_ns.route('/<string:symbol>/price')
class AssetPriceResource(Resource):
    def get(self, symbol):
        try:
            result = fetch_latest_prices([symbol.upper()])
            if symbol not in result:
                return {"error": "No data"}, 404
            return result[symbol], 200
        except Exception as e:
            return {"error": str(e)}, 500
        
@api_ns.route('/gains')
class AssetGainsResource(Resource):
    def get(self):
        """Returns gain/loss percentages for all assets."""
        try:
            assets = Asset.query.all()
            return [
                {
                    "symbol": asset.symbol,
                    "day_changeP": asset.day_changeP,
                    "sector": asset.sector,
                    "asset_type": asset.asset_type
                }
                for asset in assets
            ], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

@api_ns.route('/search')
class AssetSearchResource(Resource):
    def get(self):
        """
        Search for assets by symbol or name.
        Query parameter: q (search term)
        Returns assets matching the search term in symbol or name.
        Example: GET /assets/search?q=AAPL
        """
        search_term = request.args.get('q', '').strip()
        
        if not search_term:
            return {"error": "Search term is required. Use ?q=search_term"}, 400
        
        if len(search_term) < 1:
            return {"error": "Search term must be at least 1 character"}, 400
        
        try:
            results = search_assets(search_term)
            return results, 200
            
        except Exception as e:
            return {"error": str(e)}, 500
        

#market movers list (static)
watchlist = [
    "WK", "ATEC", "TILE", "BIO", "IRTC", "APPF", "RDDT", "AUPH", "RKT", "COOP",  # Gainers
    "FLR", "NSP", "ENVX", "LUMN", "EMN", "SATS", "INOD", "RIOT", "COIN", "NWL",  # Losers
    "NVDA", "AMZN", "VALE", "LCID", "SOFI", "TSLA", "AAPL", "HOOD", "NIO", "AMD"  # Actives
]
@api_ns.route('/market_movers')
class MarketMoversResource(Resource):
    def get(self):
        """
        Returns top 3 gainers and top 2 losers from the static market movers list.
        """
        try:
            movers = []

            for symbol in watchlist:
                try:
                    info = get_asset_info(symbol) # gets info from the get_asset_info function
                    if info and "day_changeP" in info:
                        movers.append({
                            "symbol": symbol,
                            "name": info.get("name", symbol),
                            "price": info.get("price"),
                            "day_changeP": info.get("day_changeP")
                        })
                except Exception:
                    continue  # Skip if info fails

            sorted_movers = sorted(movers, key=lambda x: x["day_changeP"], reverse=True)
            top_3_gainers = sorted_movers[:3]
            top_2_losers = sorted_movers[-2:]

            return top_3_gainers + top_2_losers, 200

        except Exception as e:
            return {"error": str(e)}, 500