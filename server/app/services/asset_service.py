import yfinance as yf
from datetime import datetime, timezone

from app import db
from app.models.asset import Asset
from app.models.asset_history import AssetHistory

from app.services.cache import cache

def fetch_latest_prices(symbols):
    uncached_symbols = [s for s in symbols if s not in cache]
    
    for symbol in uncached_symbols:
        cache[symbol] = fetch_asset_metadata(symbol)
        print(f"Cached metadata for: {symbol}")

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

    if symbol in cache:
        return cache[symbol]['price']
    else:
        cache[symbol] = fetch_asset_metadata(symbol)
        print(f"Cached metadata for: {symbol}")
    
    return cache[symbol]['price']

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

    price = info.get("regularMarketPrice", 0)
    sector = info.get("sector", "N/A")
    asset_type = info.get("quoteType", "stock")
    day_change = info.get("regularMarketChange", 0)
    day_changeP = info.get("regularMarketChangePercent", 0)

    return {
        "price":price,
        "sector": sector,
        "asset_type": asset_type,
        "day_change": round(day_change, 2),
        "day_changeP": round(day_changeP, 2),
        "update_time": datetime.now(timezone.utc).isoformat()
    }

def get_asset_info(symbol):
    """
    Helper function to fetch asset details from yfinance.
    Returns a dict with name, asset_type, sector, and day_changeP.
    Calculates day_changeP
    """
    ticker = yf.Ticker(symbol)
    info = ticker.info

    name = info.get("longName", "Unknown")
    asset_type = info.get("quoteType", "N/A")
    sector = info.get("sector", "N/A") or info.get("industry", "N/A")
    current_price = info.get("regularMarketPrice")
    previous_close = info.get("regularMarketPreviousClose")

    if current_price is not None and previous_close:
        try:
            day_changeP = round(((current_price - previous_close) / previous_close) * 100, 2)
        except ZeroDivisionError:
            day_changeP = 0.0
    else:
        day_changeP = 0.0

    return {
        "name": name,
        "asset_type": asset_type,
        "sector": sector,
        "price": current_price,
        "day_changeP": day_changeP
    }

def search_assets(search_term):
    """
    Search for assets by symbol or name.
    Returns a list of assets matching the search term.
    Includes database search and automatic symbol discovery.
    """
    if not search_term or len(search_term) < 1:
        return []
    
    try:
        # Search in database first
        search_pattern = f"%{search_term.upper()}%"
        db_assets = Asset.query.filter(
            db.or_(
                Asset.symbol.ilike(search_pattern),
                Asset.name.ilike(search_pattern)
            )
        ).limit(10).all()
        
        results = []
        
        # Add database results with current prices
        for asset in db_assets:
            try:
                # Get current price from yfinance
                info = get_asset_info(asset.symbol)
                results.append({
                    "id": asset.id,
                    "symbol": asset.symbol,
                    "name": asset.name,
                    "asset_type": asset.asset_type,
                    "sector": asset.sector,
                    "current_price": info.get("price"),
                    "day_changeP": info.get("day_changeP")
                })
            except Exception:
                # If yfinance fails, use asset without current price
                results.append({
                    "id": asset.id,
                    "symbol": asset.symbol,
                    "name": asset.name,
                    "asset_type": asset.asset_type,
                    "sector": asset.sector,
                    "current_price": None,
                    "day_changeP": 0.0
                })
        
        # If we have fewer than 10 results and search term looks like a symbol,
        # try to find it in yfinance and add to database
        if len(results) < 10 and len(search_term) <= 5 and search_term.isalpha():
            try:
                symbol = search_term.upper()
                # Check if this symbol already exists in our results
                existing_symbols = [r["symbol"] for r in results]
                
                if symbol not in existing_symbols:
                    info = get_asset_info(symbol)
                    if info and info.get("name") != "Unknown":
                        # Check if asset exists in database
                        existing_asset = Asset.query.filter_by(symbol=symbol).first()
                        
                        if not existing_asset:
                            # Add new asset to database
                            new_asset = Asset(
                                symbol=symbol,
                                name=info["name"],
                                asset_type=info["asset_type"],
                                sector=info["sector"],
                                day_changeP=info["day_changeP"]
                            )
                            db.session.add(new_asset)
                            db.session.commit()
                            
                            results.insert(0, {
                                "id": new_asset.id,
                                "symbol": new_asset.symbol,
                                "name": new_asset.name,
                                "asset_type": new_asset.asset_type,
                                "sector": new_asset.sector,
                                "current_price": info.get("price"),
                                "day_changeP": info.get("day_changeP")
                            })
            except Exception:
                pass  # Ignore errors when trying to add new symbols
        
        return results
        
    except Exception as e:
        print(f"Error searching assets: {e}")
        return []