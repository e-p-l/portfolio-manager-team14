from app import db
from app.models.watchlist import Watchlist
from app.models.asset import Asset
from app.models.portfolio import Portfolio

from datetime import datetime, timezone

def add_to_watchlist(portfolio_id, asset_id, notes=None):
    """
    Adds an asset to a portfolio's watchlist.
    """
    # Check if portfolio exists
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        raise ValueError("Portfolio not found.")

    # Check if asset exists
    asset = Asset.query.get(asset_id)
    if not asset:
        raise ValueError("Asset not found.")

    # Check if already in watchlist
    existing = Watchlist.query.filter_by(portfolio_id=portfolio_id, asset_id=asset_id).first()
    if existing:
        raise ValueError("Asset is already in watchlist.")

    # Create new watchlist entry
    watchlist_item = Watchlist(
        portfolio_id=portfolio_id,
        asset_id=asset_id,
        notes=notes
    )
    
    db.session.add(watchlist_item)
    db.session.commit()

    return watchlist_item

def remove_from_watchlist(watchlist_id):
    """
    Removes an asset from watchlist by watchlist ID.
    """
    watchlist_item = Watchlist.query.get(watchlist_id)
    if not watchlist_item:
        raise ValueError("Watchlist item not found.")

    db.session.delete(watchlist_item)
    db.session.commit()

    return True

def remove_from_watchlist_by_asset(portfolio_id, asset_id):
    """
    Removes an asset from watchlist by portfolio_id and asset_id.
    """
    watchlist_item = Watchlist.query.filter_by(portfolio_id=portfolio_id, asset_id=asset_id).first()
    if not watchlist_item:
        raise ValueError("Asset not found in watchlist.")

    db.session.delete(watchlist_item)
    db.session.commit()

    return True

def get_watchlist_by_portfolio(portfolio_id):
    """
    Gets all watchlist items for a specific portfolio.
    """
    # Check if portfolio exists
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        raise ValueError("Portfolio not found.")

    watchlist_items = Watchlist.query.filter_by(portfolio_id=portfolio_id).all()
    return watchlist_items