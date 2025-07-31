from ..models.asset import Asset
from ..services.asset_service import fetch_asset_metadata, fetch_latest_prices
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
        Expects JSON data with 'symbol', 'name'
        """
        data = request.get_json()
        if not data or 'symbol' not in data or 'name' not in data:
            return {"error": "Missing required fields"}, 400

        try:
            metadata = fetch_asset_metadata(data['symbol'])

            new_asset = Asset(
                symbol=data['symbol'],
                name=data['name'],
                asset_type=metadata['asset_type'],
                sector=metadata['sector']
            )
            db.session.add(new_asset)
            db.session.commit()

            return new_asset.serialize(), 201
        except Exception as e:
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

@api_ns.route('/<string: symbol>/price')
class AssetPriceResource(Resource):
    def get(self, symbol):
        try:
            result = fetch_latest_prices([symbol.upper()])
            if symbol not in result:
                return {"error": "No data"}, 404
            return result[symbol], 200
        except Exception as e:
            return {"error": str(e)}, 500