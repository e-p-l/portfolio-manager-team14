from flask import jsonify
from . import api_bp
from ..models.transaction import Transaction

@api_bp.route("/transactions", methods=["GET"])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([t.serialize() for t in transactions])
