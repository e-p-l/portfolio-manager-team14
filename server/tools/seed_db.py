import sys
import os
import random
import yfinance as yf
from datetime import datetime, timezone, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from app import create_app, db
from app.models.portfolio import Portfolio
from app.models.asset import Asset
from app.routes.assets import get_asset_info
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.models.portfolio_history import PortfolioHistory

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

def generate_portfolio_history(portfolio_id, years=3):
    """
    Generate portfolio history for the specified number of years with realistic market movements.
    Similar to the frontend mock data but stored in the database.
    """
    print(f"🔄 Generating {years} years of portfolio history...")
    
    base_value = 100000  # $100,000 starting value
    today = datetime.now().date()
    start_date = today - timedelta(days=years * 365)
    
    current_date = start_date
    current_value = base_value
    volatility = 0.005  # Daily volatility
    annual_growth = 0.12  # 12% annual growth
    daily_growth = (1 + annual_growth) ** (1/365) - 1
    
    history_records = []
    
    while current_date <= today:
        # Add randomness for realistic market movements
        random_factor = 1 + (random.random() * 2 - 1) * volatility
        growth_factor = 1 + daily_growth
        
        current_value = current_value * random_factor * growth_factor
        
        # Add market corrections and rallies based on time ago
        days_ago = (today - current_date).days
        
        # Major correction around 6 months ago (180 days)
        if 170 <= days_ago <= 190:
            current_value = current_value * 0.92  # 8% drop
        
        # Rally 3 months ago (90 days)
        if 80 <= days_ago <= 100:
            current_value = current_value * 1.07  # 7% rally
        
        # COVID-like crash simulation (if we go back far enough)
        if days_ago >= 1000 and days_ago <= 1020:  # Around 3 years ago
            current_value = current_value * 0.75  # 25% crash
        
        # Post-crash recovery
        if 980 <= days_ago <= 1000:
            current_value = current_value * 1.15  # 15% recovery
        
        # Round to 2 decimal places
        current_value = round(current_value, 2)
        # Calculate balance as 10% of portfolio value (representing cash balance)
        current_balance = round(current_value * 0.10, 2)
        
        # Check if record already exists to avoid duplicates
        existing = PortfolioHistory.query.filter_by(
            portfolio_id=portfolio_id, 
            date=current_date
        ).first()
        
        if not existing:
            history_record = PortfolioHistory(
                portfolio_id=portfolio_id,
                value=current_value,
                balance=current_balance,
                date=current_date
            )
            history_records.append(history_record)
        
        current_date += timedelta(days=1)
    
    # Bulk insert for better performance
    if history_records:
        db.session.bulk_save_objects(history_records)
        db.session.commit()
        print(f"✅ Generated {len(history_records)} portfolio history records")
    else:
        print("ℹ️ No new history records to generate (already exist)")

if __name__ == "__main__":
    ans = input("This will overwrite your database. Continue? [y/n] ")
    if ans.lower() == 'y':
        seed_database()
        
        # Generate portfolio history for all portfolios
        app = create_app()
        with app.app_context():
            portfolios = Portfolio.query.all()
            for portfolio in portfolios:
                generate_portfolio_history(portfolio.id, years=3)
        
        print("🎉 Database seeding completed with portfolio history!")
    else:
        print("Cancelled.")
