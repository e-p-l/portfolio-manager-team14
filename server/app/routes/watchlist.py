from . import api_bp
from server.app.services.watchlist_service import fetch_historical_prices, fetch_latest_prices

from flask import jsonify

__SYMBOLS = ['TSLA', 'NVDA']

@api_bp.route("/watchlist/historical", methods=['GET'])
def get_historical():
    """ 
    Returns a jsonified DataFrame of historical stock data for a given symbol.
    Contains Close, Open, High, Low, Volume, and Date columns.
    """
    data = fetch_historical_prices(__SYMBOLS)

    if data is not None:
        return jsonify(data)
    else:
        raise ValueError("Error")

@api_bp.route("/watchlist/latest", methods=['GET'])
def get_latest():
    """
    Returns the latest stock price for a predefined list of symbols.
    """
    data = fetch_latest_prices(__SYMBOLS)

    if data is not None:
        return jsonify(data)
    else:
        raise ValueError("Error")
    
