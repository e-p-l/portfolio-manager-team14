##################################################
#
# Script to seed the database with initial data
#
##################################################

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from datetime import datetime

from app import create_app, db
from app.models.portfolio import Portfolio
from app.models.asset import Asset
from app.models.holding import Holding
from app.models.transaction import Transaction

def seed_database():
    app = create_app()

    with app.app_context():
        # drop all tables and recreate them for a clean slate
        db.drop_all()
        db.create_all()

        # create sample assets
        asset1 = Asset(symbol="NVDA", name="NVIDIA Corporation", asset_type="stock", sector="Technology")
        asset2 = Asset(symbol="TSLA", name="Tesla Inc.", asset_type="stock", sector="Automotive")
        asset3 = Asset(symbol="AAPL", name="Apple Inc.", asset_type="stock", sector="Technology")
        asset4 = Asset(symbol="BTC", name="Bitcoin", asset_type="crypto", sector="Cryptocurrency")
        asset5 = Asset(symbol="GOOGL", name="Alphabet Inc.", asset_type="stock", sector="Technology")
        db.session.add_all([asset1, asset2, asset3, asset4, asset5])
        db.session.commit()

        # create sample portfolios
        portfolio1 = Portfolio(name="Alice's Growth Portfolio")
        portfolio4 = Portfolio(name="Alice's Tech Portfolio")
        db.session.add_all([portfolio1, portfolio4])
        db.session.commit()

        # create sample holdings
        holding1 = Holding(portfolio_id=portfolio1.id, asset_id=asset1.id, quantity=10, purchase_price=400, purchase_date=datetime(2024, 7, 1))
        holding2 = Holding(portfolio_id=portfolio1.id, asset_id=asset2.id, quantity=5, purchase_price=700, purchase_date=datetime(2024, 7, 1))
        holding6 = Holding(portfolio_id=portfolio4.id, asset_id=asset1.id, quantity=7, purchase_price=410, purchase_date=datetime(2024, 7, 10))
        holding7 = Holding(portfolio_id=portfolio4.id, asset_id=asset3.id, quantity=12, purchase_price=155, purchase_date=datetime(2024, 7, 15))
        holding8 = Holding(portfolio_id=portfolio4.id, asset_id=asset5.id, quantity=4, purchase_price=2800, purchase_date=datetime(2024, 7, 20))
        db.session.add_all([holding1, holding2, holding6, holding7, holding8])
        db.session.commit()

        # create sample transactions (now using holding_id instead of asset_id)
        txn1 = Transaction(portfolio_id=portfolio1.id, holding_id=holding1.id, quantity=10, price=400, created_at=datetime(2024, 7, 1), transaction_type="buy")
        txn2 = Transaction(portfolio_id=portfolio1.id, holding_id=holding2.id, quantity=5, price=700, created_at=datetime(2024, 7, 10), transaction_type="buy")
        txn6 = Transaction(portfolio_id=portfolio4.id, holding_id=holding6.id, quantity=7, price=410, created_at=datetime(2024, 7, 21), transaction_type="buy")
        txn7 = Transaction(portfolio_id=portfolio4.id, holding_id=holding7.id, quantity=12, price=155, created_at=datetime(2024, 7, 22), transaction_type="buy")
        txn8 = Transaction(portfolio_id=portfolio4.id, holding_id=holding8.id, quantity=4, price=2800, created_at=datetime(2024, 7, 23), transaction_type="buy")
        db.session.add_all([txn1, txn2, txn6, txn7, txn8])
        db.session.commit()

        print("✅ Seeded database with initial data.")

if __name__ == "__main__":
    ans = input("Are you sure you want overwrite the database? [y/n] ")
    
    if ans.lower() == 'y':
        seed_database()
        print("Database seed completed successfully.")
    else:
        print("Database seed aborted.")