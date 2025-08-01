import sys
import os
import random
import yfinance as yf
from datetime import datetime, timezone

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from app import create_app, db
from app.models.portfolio import Portfolio
from app.models.asset import Asset
from app.routes.assets import get_asset_info
from app.models.holding import Holding
from app.models.transaction import Transaction

def seed_database():
    app = create_app()

    with app.app_context():
        db.drop_all()
        db.create_all()

        # === Fetch live data for one real stock ===
        symbol = "VOO"
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d")

        if data.empty:
            print("❌ No data returned from yfinance for", symbol)
            return

        price = round(data["Close"].iloc[-1], 2)
        print(f"✅ Live price for {symbol} is ${price}")

        # === Insert live-data-backed objects ===
        info = get_asset_info(symbol)
        asset = Asset(symbol=symbol, name="Vanguard S&P 500", asset_type="stock", sector="ETF", day_changeP=info['day_changeP'])
        db.session.add(asset)
        db.session.commit()

        portfolio = Portfolio(name="Real Market Portfolio")
        db.session.add(portfolio)
        db.session.commit()

        holding = Holding(
            portfolio_id=portfolio.id,
            asset_id=asset.id,
            quantity=5,
            purchase_price=price,
            purchase_date=datetime.now(timezone.utc)
        )
        db.session.add(holding)
        db.session.commit()

        txn = Transaction(
            portfolio_id=portfolio.id,
            holding_id=holding.id,
            quantity=5,
            price=price,
            created_at=datetime.now(timezone.utc),
            transaction_type="buy"
        )
        db.session.add(txn)
        db.session.commit()

        print("✅ MySQL seeded with live VOO data.")

        # === ADDITIONAL HOLDINGS ===
        extra_holdings = [
            ("AAPL", "Apple Inc."),
            ("MSFT", "Microsoft Corporation"),
            ("GOOGL", "Alphabet Inc."),
            ("AMZN", "Amazon.com Inc."),
            ("TSLA", "Tesla Inc."),
            ("NVDA", "NVIDIA Corporation"),
            ("META", "Meta Platforms Inc."),
            ("JPM", "JPMorgan Chase & Co."),
            ("JNJ", "Johnson & Johnson"),
            ("V", "Visa Inc."),
            ("UNH", "UnitedHealth Group"),
            ("PG", "Procter & Gamble"),
            ("MA", "Mastercard Inc."),
            ("HD", "Home Depot"),
            ("BAC", "Bank of America"),
            ("PFE", "Pfizer Inc."),
            ("DIS", "Walt Disney Co."),
            ("KO", "Coca-Cola Co."),
            ("PEP", "PepsiCo Inc."),
            ("CSCO", "Cisco Systems"),
            ("XOM", "ExxonMobil"),
            ("CVX", "Chevron Corporation"),
            ("WMT", "Walmart Inc."),
            ("INTC", "Intel Corporation"),
            ("T", "AT&T Inc."),
            ("BA", "Boeing Co."),
            ("ADBE", "Adobe Inc."),
            ("ORCL", "Oracle Corporation"),
            ("NFLX", "Netflix Inc."),
            ("NKE", "Nike Inc."),
            ("CRM", "Salesforce Inc."),
            ("ABT", "Abbott Laboratories"),
            ("MRK", "Merck & Co."),
            ("COST", "Costco Wholesale"),
            ("AVGO", "Broadcom Inc."),
            ("MCD", "McDonald’s Corp."),
            ("QCOM", "Qualcomm Inc."),
            ("TXN", "Texas Instruments"),
            ("HON", "Honeywell International")
        ]

        # Random asset types
        asset_types = (
            ["equity"] * 20 +
            ["etf"] * 5 +
            ["mutualfund"] * 2 +
            ["index"] * 3 +
            ["currency"] * 3 +
            ["cryptocurrency"] * 6 +
            ["etf"]  # 1 for commodity proxy
        )
        random.shuffle(asset_types)

        for (sym, name), asset_type in zip(extra_holdings, asset_types):
            try:
                ticker = yf.Ticker(sym)
                data = ticker.history(period="1d")

                if data.empty:
                    print(f"❌ No data for {sym}")
                    continue

                price = round(data["Close"].iloc[-1], 2)

                # Separate: fetch full info and custom info
                yf_info = ticker.info
                custom_info = get_asset_info(sym)

                sector = yf_info.get("sector", "Unknown").split()[0] if "sector" in yf_info else "Unknown"
                day_changeP = custom_info['day_changeP']

                asset = Asset(
                    symbol=sym,
                    name=name,
                    asset_type=asset_type,
                    sector=sector,
                    day_changeP=day_changeP
                )
                db.session.add(asset)
                db.session.commit()

                quantity = random.randint(1, 100)

                holding = Holding(
                    portfolio_id=portfolio.id,
                    asset_id=asset.id,
                    quantity=quantity,
                    purchase_price=price,
                    purchase_date=datetime.now(timezone.utc)
                )

                db.session.add(holding)
                db.session.commit()

                txn = Transaction(
                    portfolio_id=portfolio.id,
                    holding_id=holding.id,
                    quantity=quantity,
                    price=price,
                    created_at=datetime.now(timezone.utc),
                    transaction_type="buy"
                )
                
                db.session.add(txn)
                db.session.commit()

                print(f"✅ Added {sym} (${price}) | Sector: {sector}, Type: {asset_type}")

            except Exception as e:
                print(f"❌ Error adding {sym}: {e}")

if __name__ == "__main__":
    ans = input("This will overwrite your database. Continue? [y/n] ")
    if ans.lower() == 'y':
        seed_database()
    else:
        print("Cancelled.")
