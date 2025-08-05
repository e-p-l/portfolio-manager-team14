from .. import db
from ..models.portfolio import Portfolio
from ..models.portfolio_history import PortfolioHistory

from ..services.portfolio_service import backfill_portfolio_history
from ..services.holding_service import get_portfolio_aum, get_portfolio_return

from flask import request
from sqlalchemy.exc import SQLAlchemyError
from flask_restx import Namespace, Resource, fields
from datetime import datetime, timezone

api_ns = Namespace('portfolios', description='Portfolio operations')

portfolio_input_models = {
    'create': api_ns.model('Portfolio', {
        'name': fields.String(required=True),
    }),
    'backfill': api_ns.model('PortfolioUpdate', {
        'start': fields.String(required=False),
    })
}

@api_ns.route('/')
class PortfolioListResource(Resource):
    def get(self):
        """Returns a list of all portfolios in the database."""
        try:
            portfolios = Portfolio.query.all()
            return [p.serialize() for p in portfolios], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @api_ns.expect(portfolio_input_models['create'])
    def post(self):
        """
        Creates a new portfolio.
        Expects JSON with 'name'.
        """
        data = request.get_json()
        if not data or 'name' not in data:
            return {"error": "Invalid input"}, 400

        try:
            new_portfolio = Portfolio(name=data['name'])
            db.session.add(new_portfolio)
            db.session.commit()
            return new_portfolio.serialize(), 201
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

@api_ns.route('/<int:portfolio_id>')
class PortfolioResource(Resource):
    def get(self, portfolio_id):
        """Returns a specific portfolio by its ID."""
        try:
            portfolio = Portfolio.query.get(portfolio_id)
            if portfolio:
                portfolio_data = portfolio.serialize()
                portfolio_data['aum'] = get_portfolio_aum(portfolio_id)
                portfolio_data['return'] = get_portfolio_return(portfolio_id)
                return portfolio_data, 200
            else:
                return {"error": "Portfolio not found"}, 404
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @api_ns.expect(portfolio_input_models['create'])
    def put(self, portfolio_id):
        """
        Updates an existing portfolio.
        Expects JSON with optional 'name'.
        """
        data = request.get_json()
        portfolio = Portfolio.query.get(portfolio_id)
        if not portfolio:
            return {"error": "Portfolio not found"}, 404

        try:
            if 'name' in data:
                portfolio.name = data['name']
                portfolio.updated_at = datetime.now(timezone.utc)
            db.session.commit()

            return portfolio.serialize(), 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    def delete(self, portfolio_id):
        """Deletes a portfolio by its ID."""
        portfolio = Portfolio.query.get(portfolio_id)
        if not portfolio:
            return {"error": "Portfolio not found"}, 404

        try:
            db.session.delete(portfolio)
            db.session.commit()
            return {"message": "Portfolio deleted successfully"}, 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

@api_ns.route('/<int:portfolio_id>/history')
class PortfolioHistoryResource(Resource):
    def get(self, portfolio_id):
        """
        Get all historical values for a portfolio.
        """
        try:
            # backfill_portfolio_history(portfolio_id)
            history = PortfolioHistory.query.filter_by(portfolio_id=portfolio_id).order_by(PortfolioHistory.date).all()
            return [h.serialize() for h in history], 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

@api_ns.route('/<int:portfolio_id>/transactions')
class PortfolioTransactionsResource(Resource):
    def get(self, portfolio_id):
        """
        Get all transactions for a specific portfolio.
        """
        try:
            from ..models.transaction import Transaction
            
            transactions = Transaction.query.filter_by(portfolio_id=portfolio_id).order_by(Transaction.created_at.desc()).all()
            return [t.serialize() for t in transactions], 200
        except Exception as e:
            return {"error": str(e)}, 500