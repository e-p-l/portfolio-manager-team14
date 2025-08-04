from app.models.portfolio import Portfolio
from app.models.holding import Holding
from app.models.asset import Asset
from app.models.asset_history import AssetHistory
from app.models.portfolio_history import PortfolioHistory
from app import db

from datetime import datetime, timezone

import yfinance as yf
from datetime import timedelta

def calculate_portfolio_value(portfolio_id: int) -> float:
    """
    Returns the total market value of a portfolio by summing current value of all holdings.
    Uses Asset.current_price for calculation.
    """
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return None
    
    total_value = 0.0
    for holding in portfolio.holdings:
        asset = Asset.query.get(holding.asset_id)
        if asset and asset.current_price is not None:
            total_value += holding.quantity * asset.current_price
    return total_value

def asset_allocation(portfolio_id: int):
    """
    Returns asset allocation breakdown by asset_type for a portfolio.
    """
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return None

    allocation = {}
    total_value = calculate_portfolio_value(portfolio_id)
    if not total_value:
        return {}

    for holding in portfolio.holdings:
        asset = Asset.query.get(holding.asset_id)
        if asset and asset.current_price is not None:
            value = holding.quantity * asset.current_price

            if asset.asset_type not in allocation:
                allocation[asset.asset_type] = 0.0
            else:
                allocation[asset.asset_type] += value

    # Convert to percentage
    for type in allocation:
        allocation[type] = round((allocation[type] / total_value) * 100, 2)

    return allocation

def backfill_portfolio_history(portfolio_id):
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return None

    current = portfolio.creation_date
    while current <= datetime.now(timezone.utc).date():
        value = 0.0
        for holding in portfolio.holdings:
            if holding.purchase_date.date() > current:
                continue

            asset = Asset.query.get(holding.asset_id)
            ticker = yf.Ticker(asset.symbol.upper())
            hist = ticker.history(start=current, end=current + timedelta(days=1))
            close = hist['Close'].iloc[0] if not hist.empty else None

            if close:
                value += holding.quantity * close
                existing_history = AssetHistory.query.filter_by(asset_id=asset.id, date=current).first()
                if not existing_history:
                    db.session.add(AssetHistory(asset_id=asset.id, price=close, date=current))
            
        if value != 0.0:
            existing = PortfolioHistory.query.filter_by(date=current, portfolio_id=portfolio_id).first()
            if not existing:
                db.session.add(PortfolioHistory(date=current, value=value, portfolio_id=portfolio_id))
        current += timedelta(days=1)

    db.session.commit()