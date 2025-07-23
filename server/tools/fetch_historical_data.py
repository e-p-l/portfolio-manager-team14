import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


import yfinance as yf
from app import create_app, db
from app.models.asset import Asset
from app.models.portfolio import Portfolio
from app.models.transaction import Transaction

app = create_app()

def fetch_price_data(symbol: str, period="30d", interval="1d"):
    """ Download historical data for a given symbol. """

    return yf.download(symbol, period=period, interval=interval, auto_adjust=True)

def create_portfolio(name="Realistic Portfolio"):
    """ Create and return a new portfolio. """
    portfolio = Portfolio(name=name)
    db.session.add(portfolio)
    db.session.commit()

    return portfolio

def create_asset(symbol, name, asset_type="Stock"):
    """Create and return a new asset."""
    asset = Asset(symbol=symbol, name=name, asset_type=asset_type)
    db.session.add(asset)
    db.session.commit()

    return asset

def create_transactions(portfolio, asset, price_data):
    """ Create buy transactions for each historical price entry. """
    for date, row in price_data.iterrows():
        txn = Transaction(
            portfolio_id=portfolio.id,
            asset_id=asset.id,
            transaction_type="buy",
            quantity=10,  # Fixed quantity for simplicity
            price=row['Close'].iloc[0],
            date=date.to_pydatetime()
        )
        db.session.add(txn)
    db.session.commit()

def seed_real_data():
    with app.app_context():
        db.drop_all()
        db.create_all()

        portfolio = create_portfolio()
        asset = create_asset("AAPL", "Apple Inc.")

        price_data = fetch_price_data("AAPL")
        create_transactions(portfolio, asset, price_data)

        print("✅ Seeded database with realistic AAPL historical data.")

if __name__ == "__main__":
    seed_real_data()
