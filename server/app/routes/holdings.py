from .. import db
from ..models.holding import Holding

from flask import request
from sqlalchemy.exc import SQLAlchemyError
from flask_restx import Namespace, Resource, fields

api_ns = Namespace('holdings', description='Holding operations')
holding_model = api_ns.model('Holding', {
    'portfolio_id': fields.Integer(required=True),
    'asset_id': fields.Integer(required=True),
    'quantity': fields.Float(required=True),
    'purchase_price': fields.Float(required=True)
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

    @api_ns.expect(holding_model)
    def post(self):
        """
        Creates a new holding.
        Expects JSON with portfolio_id, asset_id, quantity, and purchase_price.
        """
        data = request.get_json()
        if not data or 'portfolio_id' not in data or 'asset_id' not in data or 'quantity' not in data or 'purchase_price' not in data:
            return {"error": "Invalid input"}, 400

        try:
            new_holding = Holding(
                portfolio_id=data['portfolio_id'],
                asset_id=data['asset_id'],
                quantity=data['quantity'],
                purchase_price=data['purchase_price']
            )
            db.session.add(new_holding)
            db.session.commit()
            return new_holding.serialize(), 201
        except SQLAlchemyError as e:
            db.session.rollback()
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

    @api_ns.expect(holding_model)
    def put(self, holding_id):
        """
        Updates an existing holding.
        Expects JSON with optional fields: quantity and purchase_price.
        """
        data = request.get_json()
        holding = Holding.query.get(holding_id)
        if not holding:
            return {"error": "Holding not found"}, 404

        try:
            if 'quantity' in data:
                holding.quantity = data['quantity']
            if 'purchase_price' in data:
                holding.purchase_price = data['purchase_price']
            db.session.commit()
            return holding.serialize(), 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    def delete(self, holding_id):
        """Deletes a specific holding by its ID."""
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
