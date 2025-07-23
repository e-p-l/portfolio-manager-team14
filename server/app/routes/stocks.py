from flask import jsonify
from . import api_bp
from app.services.stock_service import fetch_historical_prices, fetch_latest_prices
import pandas as pd

__SYMBOLS = ['TSLA', 'NVDA']

@api_bp.route("/historical", methods=['GET'])
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

@api_bp.route("/latest", methods=['GET'])
def get_latest():
    """
    Returns the latest stock price for a predefined list of symbols.
    """
    symbols = ['TSLA', 'NVDA']
    data = fetch_latest_prices(symbols)

    if data is not None:
        return jsonify(data)
    else:
        raise ValueError("Error")
    
