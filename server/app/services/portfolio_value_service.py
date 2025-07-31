from app import db
from app.models.portfolio_value import PortfolioValue
from app.models.portfolio import Portfolio
from app.models.asset import Asset
from app.models.holding import Holding
import yfinance as yf
from datetime import date, timedelta

def update_historical_portfolio_values(portfolio_id, start_date, end_date):
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return None

    current = start_date
    while current <= end_date:
        value = 0.0
        for holding in portfolio.holdings:
            asset = Asset.query.get(holding.asset_id)
            if asset:
                ticker = yf.Ticker(asset.symbol.upper())
                try:
                    hist = ticker.history(start=current, end=current + timedelta(days=1))
                    close = hist['Close'].iloc[0] if not hist.empty else None
                    if close:
                        value += holding.quantity * close
                except Exception as e:
                    continue

        if value:
            existing = PortfolioValue.query.filter_by(date=current, portfolio_id=portfolio_id).first()
            if not existing:
                db.session.add(PortfolioValue(date=current, value=value, portfolio_id=portfolio_id))

        current += timedelta(days=1)

    db.session.commit()
