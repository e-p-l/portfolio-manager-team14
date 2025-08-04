import yfinance as yf
from cachetools import TTLCache
from datetime import datetime, timezone

from app import db
from app.models.asset import Asset
from app.models.asset_history import AssetHistory

cache = TTLCache(maxsize=100, ttl=300)

def fetch_latest_prices(symbols):
    # Fetches the latest stock prices for the given symbols. with caching
    uncached_symbols = [s for s in symbols if s not in cache]
    for symbol in uncached_symbols:
        try:
            metadata = fetch_asset_metadata(symbol)
            cache[symbol] = {
                'price': metadata['price'],
                'day_change': metadata['day_change'],
                'day_changeP': metadata['day_changeP'],
                'sector': metadata['sector'],
                'asset_type': metadata['asset_type'],
                'update_time': datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            print(f"Error fetching data for {symbol}:", e)

    return {symbol: cache[symbol] for symbol in symbols if symbol in cache}

def fetch_latest_price(asset_id):
    """
    Fetches the latest price for a given asset_id 
    """
    asset = Asset.query.get(asset_id)
    if not asset:
        print(f"Asset with id {asset_id} not found.")
        return None

    symbol = asset.symbol.upper()
    ticker = yf.Ticker(symbol)
    info = ticker.info
    price = info.get("regularMarketPrice", None)

    return price

def update_asset_history(asset_id, price, date):
    """
    Updates the asset_history table for the given asset,date and price.
    """
    history = AssetHistory.query.filter_by(asset_id=asset_id, date=date).first()
    if history:
        history.price = price
    else:
        history = AssetHistory(asset_id=asset_id, price=price, date=date)
        db.session.add(history)
    db.session.commit()

def fetch_asset_metadata(symbol):
    """
    Fetches metadata like sector and type from yfinance.
    """
    ticker = yf.Ticker(symbol)
    info = ticker.info

    sector = info.get("sector", "N/A")
    asset_type = info.get("quoteType", "stock")  # 'ETF', 'equity', 'mutualfund', etc.

    # Day change calculation
    current_price = info.get("regularMarketPrice", 0)
    previous_close = info.get("previousClose", 0)
    day_change = current_price - previous_close
    day_changeP = ((day_change / previous_close) * 100) if previous_close else 0

    return {
        "price": current_price,
        "day_change": round(day_change, 2),
        "day_changeP": round(day_changeP, 2),
        "sector": sector,
        "asset_type": asset_type
    }

def fetch_historical_prices(symbols, period="1y", interval="1d"):
    """
    Fetches historical stock data for the given symbols.
    """
    data = yf.download(tickers=symbols, period=period, interval=interval, progress=False, auto_adjust=True)
    data.columns = ['_'.join(col) for col in data.columns.values]
    result = dataframe_to_nested_dict(data)
    
    return result

def dataframe_to_nested_dict(df):
    """
    Converts a DataFrame with columns like 'Close_NVDA' to a nested dict:
    """
    result = {}
    for idx, row in df.iterrows():
        date_str = str(idx)
        result[date_str] = {}
        for col in df.columns:
            if '_' in col:
                field, symbol = col.split('_', 1)
                if symbol not in result[date_str]:
                    result[date_str][symbol] = {}
                result[date_str][symbol][field] = row[col]
    return result

def save_price_to_db(symbol, price, date):
    """
    Save the fetched price into a MySQL table called `asset_history`.
    """
    try:
        asset = Asset.query.filter_by(symbol=symbol).first()
        if not asset:
            print(f"Asset {symbol} not found in database.")
            return None
        
        asset_history = AssetHistory(
            asset_id=asset.id,
            price=price,
            date=date
        )
        db.session.add(asset_history)
        db.session.commit()
    except Exception as e:
        print("Database error:", e)