from flask import request, jsonify
from . import api_bp
from ..models.portfolio import Portfolio
from .. import db

@api_bp.route("/portfolios", methods=["GET"])
def get_portfolios():
    portfolios = Portfolio.query.all()
    return jsonify([p.serialize() for p in portfolios])

@api_bp.route("/portfolios", methods=["POST"])
def create_portfolio():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return {"error": "Name is required"}, 400
    portfolio = Portfolio(name=name)
    db.session.add(portfolio)
    db.session.commit()
    return portfolio.serialize(), 201
