from app.models.portfolio import Portfolio
from app.models.holding import Holding
from app.models.asset import Asset
from app.models.asset_history import AssetHistory
from app.models.portfolio_history import PortfolioHistory
from app import db

from datetime import datetime, timezone

import yfinance as yf
from datetime import timedelta

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
            balance = round(value * 0.10, 2)  # 10% as cash balance
            existing = PortfolioHistory.query.filter_by(date=current, portfolio_id=portfolio_id).first()
            if not existing:
                db.session.add(PortfolioHistory(date=current, value=value, balance=balance, portfolio_id=portfolio_id))
        current += timedelta(days=1)

    db.session.commit()