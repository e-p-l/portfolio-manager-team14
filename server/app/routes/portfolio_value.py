from flask_restx import Namespace, Resource, fields
from flask import request
from datetime import datetime, date
from .. import db
from ..models.portfolio_value import PortfolioValue
from ..services.portfolio_value_service import update_historical_portfolio_values

api_ns = Namespace('portfolio_values', description='Portfolio Value Tracking')

portfolio_value_model = api_ns.model('PortfolioValue', {
    'id': fields.Integer(readOnly=True),
    'date': fields.String(required=True),
    'value': fields.Float(required=True),
    'portfolio_id': fields.Integer(required=True)
})

@api_ns.route('/<int:portfolio_id>')
class PortfolioValueList(Resource):
    def get(self, portfolio_id):
        """
        Get all portfolio values by date.
        """
        values = PortfolioValue.query.filter_by(portfolio_id=portfolio_id).order_by(PortfolioValue.date).all()
        return [v.serialize() for v in values], 200

    def post(self, portfolio_id):
        """
        Generate portfolio values from start to today.
        Query param: ?start=YYYY-MM-DD
        """
        start_str = request.args.get('start')
        if not start_str:
            return {"error": "Start date is required"}, 400

        try:
            start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
            today = date.today()
            update_historical_portfolio_values(portfolio_id, start_date, today)
            return {"message": "Portfolio values updated"}, 200
        except Exception as e:
            return {"error": str(e)}, 500
