from . import api_bp
from .. import db
from ..models.portfolio import Portfolio

from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

@api_bp.route("/portfolios", methods=['GET'])
def get_portfolios():
    """
    Returns a list of all portfolios in the database.
    """
    portfolios = Portfolio.query.all()
    return jsonify([p.serialize() for p in portfolios])

@api_bp.route("/portfolios/<int:portfolio_id>", methods=['GET'])
def get_portfolio(portfolio_id: int):
    """
    Returns a specific portfolio by its ID.
    """
    portfolio = Portfolio.query.get(portfolio_id)
    if portfolio:
        return jsonify(portfolio.serialize())
    else:
        return jsonify({"error": "Portfolio not found"}), 404

@api_bp.route("/portfolios", methods=['POST'])
def create_portfolio():
    """
    Creates a new portfolio.
    Expects JSON with user_id, name, and optional description.
    """
    data = request.get_json()
    if not data or 'user_id' not in data or 'name' not in data:
        return jsonify({"error": "Invalid input"}), 400

    try:
        new_portfolio = Portfolio(
            user_id=data['user_id'],
            name=data['name'],
            description=data.get('description')
        )
        
        db.session.add(new_portfolio)
        db.session.commit()
        
        return jsonify(new_portfolio.serialize()), 201
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route("/portfolios/<int:portfolio_id>", methods=['PUT'])
def update_portfolio(portfolio_id: int):
    """
    Updates an existing portfolio.
    Expects JSON with optional name and description.
    """
    data = request.get_json()
    portfolio = Portfolio.query.get(portfolio_id)
    
    try:
        if not portfolio:
            return jsonify({"error": "Portfolio not found"}), 404

        if 'name' in data:
            portfolio.name = data['name']
        if 'description' in data:
            portfolio.description = data['description']
    
        portfolio.updated_at = datetime.utcnow()

        db.session.commit()
    
        return jsonify(portfolio.serialize())

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route("/portfolios/<int:portfolio_id>", methods=['DELETE'])
def delete_portfolio(portfolio_id: int):
    """
    Deletes a portfolio by its ID.
    """
    portfolio = Portfolio.query.get(portfolio_id)
    
    if not portfolio:
        return jsonify({"error": "Portfolio not found"}), 404
    
    try:
        db.session.delete(portfolio)
        db.session.commit()
    
        return jsonify({"message": "Portfolio deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500