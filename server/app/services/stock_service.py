import yfinance as yf
import pandas as pd

def fetch_latest_prices(symbols):
    """
    Fetches the latest stock prices for the given symbols.
    
    Args:
        symbols (list): List of stock symbols to fetch prices for.
    
    Returns:
        dict: A dictionary with stock symbols as keys and their latest prices and update times as values.
    """
    data = fetch_historical_prices(symbols, period="1d", interval="1m")

    latest_date = sorted(data.keys())[-1]
    latest_data = data[latest_date]

    result = {}
    result['update_time'] = latest_date
    for symbol in symbols:
        if symbol in latest_data:
            result[symbol] = latest_data[symbol]['Close']
    
    return result


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