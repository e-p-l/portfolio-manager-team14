from flask import jsonify
from . import api_bp
from ..models.asset import Asset
from .. import db

@api_bp.route("/assets", methods=["GET"])
def get_assets():
    assets = Asset.query.all()
    return jsonify([a.serialize() for a in assets])
