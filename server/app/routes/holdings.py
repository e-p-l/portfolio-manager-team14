from .. import db
from ..models.holding import Holding

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

    @api_ns.expect(holding_model)
    def post(self):
        """
        Creates a new holding.
        Expects JSON with portfolio_id, asset_id, quantity, purchase_price, and purchase_date.
        """
        data = request.get_json()
        print("Received data for new holding:", data)
        
        # # For now, just return success to test if request reaches server
        # return {"message": "Holdings POST request received successfully", "data": data}, 200
        
        if not data or 'portfolio_id' not in data or 'asset_id' not in data or 'quantity' not in data or 'purchase_price' not in data or 'purchase_date' not in data:
            return {"error": "Invalid input"}, 400

        try:
            new_holding = Holding(
                portfolio_id=data['portfolio_id'],
                asset_id=data['asset_id'],
                quantity=data['quantity'],
                purchase_price=data['purchase_price'],
                purchase_date=data['purchase_date']
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
        print(f"Received data for updating holding {holding_id}:", data)
        
        # # For now, just return success to test if request reaches server
        # return {"message": f"Holdings PUT request received successfully for holding {holding_id}", "data": data}, 200
        
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
        print(f"Received DELETE request for holding {holding_id}")
        
        # # For now, just return success to test if request reaches server
        # return {"message": f"Holdings DELETE request received successfully for holding {holding_id}"}, 200
        
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
        """Returns all holdings for a specific portfolio."""
        try:
            holdings = Holding.query.options(joinedload(Holding.asset)).filter_by(portfolio_id=portfolio_id).all()

            for h in holdings:
                print(f"  - Holding ID: {h.id}, Quantity: {h.quantity}, Asset: {h.asset.symbol if h.asset else 'Unknown'}")
            
            # Filter to only active holdings
            active_holdings = [h for h in holdings if h.quantity > 0]
            
            return [h.serialize() for h in active_holdings], 200
        except SQLAlchemyError as e:
            print(f"Error fetching holdings: {e}")
            return {"error": str(e)}, 500