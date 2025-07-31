import yfinance as yf
from cachetools import TTLCache
from datetime import datetime
import mysql.connector

cache = TTLCache(maxsize=100, ttl=300)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'portfolio_manager_db'
}

def get_mysql_connection():
    return mysql.connector.connect(**db_config)

def fetch_latest_prices(symbols):
    # Fetches the latest stock prices for the given symbols. with caching
    uncached_symbols = [s for s in symbols if s not in cache]
    for symbol in uncached_symbols:
        try:
            metadata = fetch_asset_metadata(symbol)
            cache[symbol] = {
                'price': metadata['price'],
                'day_change': metadata['day_change'],
                'day_change_percent': metadata['day_change_percent'],
                'sector': metadata['sector'],
                'asset_type': metadata['asset_type'],
                'update_time': datetime.utcnow()
            }
        except Exception as e:
            print(f"Error fetching data for {symbol}:", e)

    return {symbol: cache[symbol] for symbol in symbols if symbol in cache}

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
    day_change_percent = ((day_change / previous_close) * 100) if previous_close else 0

    return {
        "price": current_price,
        "day_change": round(day_change, 2),
        "day_change_percent": round(day_change_percent, 2),
        "sector": sector,
        "asset_type": asset_type
    }

# def fetch_latest_prices(symbols):
#     """
#     Fetches the latest stock prices for the given symbols.
    
#     Args:
#         symbols (list): List of stock symbols to fetch prices for.
    
#     Returns:
#         dict: A dictionary with stock symbols as keys and their latest prices and update times as values.
#     """
#     data = fetch_historical_prices(symbols, period="1d", interval="1m")

#     latest_date = sorted(data.keys())[-1]
#     latest_data = data[latest_date]

#     result = {}
#     result['update_time'] = latest_date
#     for symbol in symbols:
#         if symbol in latest_data:
#             result[symbol] = latest_data[symbol]['Close']
    
#     return result


def fetch_historical_prices(symbols, period="1y", interval="1d"):
    """
    Fetches historical stock data for the given symbols.
    
    Args:
        symbols (list[str]): Stock symbol to fetch historical data for.
        period (str): Period for which to fetch data (default is "1y").
        interval (str): Interval of the data (default is "1d").
    
    Returns:
        dict: A dictionary with stock symbols as keys and their historical data as values.
    """
    data = yf.download(tickers=symbols, period=period, interval=interval, progress=False, auto_adjust=True)

    # flatten the multi-index columns
    data.columns = ['_'.join(col) for col in data.columns.values]

    result = dataframe_to_nested_dict(data)
    
    return result

def dataframe_to_nested_dict(df):
    """
    Converts a DataFrame with columns like 'Close_NVDA' to a nested dict:
    {date: {symbol: {field: value, ...}, ...}, ...}
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

def save_price_to_db(symbol, price, timestamp):
    """
    Save the fetched price into a MySQL table called `stock_prices`.
    """
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO stock_prices (symbol, price, timestamp)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE price = VALUES(price), timestamp = VALUES(timestamp);
        """
        cursor.execute(query, (symbol, price, timestamp))
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as e:
        print("Database error:", e)