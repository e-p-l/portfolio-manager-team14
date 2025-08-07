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
from app.models.asset_history import AssetHistory
from app.models.watchlist import Watchlist
from app.services.asset_service import fetch_latest_price
from app.utils.seeding_functions import create_random_sell_transaction, generate_portfolio_history, generate_asset_history, generate_asset_history_for_new_watchlist_item

def generate_random_date_2024():
    """Generate a random date between start of 2024 and now"""
    start_2024 = datetime(2024, 1, 1, tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    time_diff = (now - start_2024).total_seconds()
    random_seconds = random.uniform(0, time_diff)
    return start_2024 + timedelta(seconds=random_seconds)

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
        asset = Asset(symbol=symbol, name="Vanguard S&P 500", asset_type="stock", sector="Consumer", day_changeP=info['day_changeP'])
        db.session.add(asset)
        db.session.commit()

        portfolio = Portfolio(name="Retirement Portfolio")
        db.session.add(portfolio)
        db.session.commit()

        # Generate random date from 2024
        random_buy_date = generate_random_date_2024()
        
        holding = Holding(
            portfolio_id=portfolio.id,
            asset_id=asset.id,
            quantity=5,
            purchase_price=price,
            purchase_date=random_buy_date
        )
        db.session.add(holding)
        db.session.commit()

        txn = Transaction(
            portfolio_id=portfolio.id,
            holding_id=holding.id,
            quantity=5,
            price=price,
            created_at=random_buy_date,
            transaction_type="buy"
        )
        db.session.add(txn)
        db.session.commit()

        # 40% chance of sell transaction after initial buy
        if random.random() < 0.4:
            create_random_sell_transaction(portfolio.id)

        print("✅ MySQL seeded with live VOO data.")

        # === ADDITIONAL HOLDINGS ===
        extra_holdings = [
            ("AAPL", "Apple Inc."),
            ("GOOGL", "Alphabet Inc."),
            ("AMZN", "Amazon.com Inc."),
            ("TSLA", "Tesla Inc."),
            ("NVDA", "NVIDIA Corporation"),
            ("JNJ", "Johnson & Johnson"),
            ("BAC", "Bank of America"),
            ("V", "Visa Inc."),
            ("PG", "Procter & Gamble"),
            ("DIS", "The Walt Disney Company"),
            ("BA", "The Boeing Company"),
            ("ADBE", "Adobe Inc."),
            ("WDAY", "Workday Inc.")

        ]

        # Random asset types
        asset_types = (
            ["equity"] * 20 +
            ["etf"] * 5 +
            ["mutualfund"] * 2 +
            ["index"] * 3 +            
            ["currency"] * 3 +
            ["cryptocurrency"] * 6 +
            ["commodity"] * 2

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

                quantity = random.randint(1, 37)

                # Generate random date from 2024 for this transaction
                random_buy_date = generate_random_date_2024()

                holding = Holding(
                    portfolio_id=portfolio.id,
                    asset_id=asset.id,
                    quantity=quantity,
                    purchase_price=price,
                    purchase_date=random_buy_date
                )

                db.session.add(holding)
                db.session.commit()

                txn = Transaction(
                    portfolio_id=portfolio.id,
                    holding_id=holding.id,
                    quantity=quantity,
                    price=price,
                    created_at=random_buy_date,
                    transaction_type="buy"
                )
                
                db.session.add(txn)
                db.session.commit()

                print(f"✅ Added {sym} (${price}) | Sector: {sector}, Type: {asset_type}")

                # 40% chance of creating a sell transaction after each buy
                if random.random() < 0.4:
                    create_random_sell_transaction(portfolio.id)

            except Exception as e:
                print(f"❌ Error adding {sym}: {e}")

        # === WATCHLIST SEEDING ===
        print("🔄 Adding watchlist items to Portfolio 1...")
        
        # Get some assets that weren't added as holdings for the watchlist
        watchlist_symbols = [
            ("GOOGL", "Alphabet Inc."),
            ("AMZN", "Amazon.com Inc."),
            ("TSLA", "Tesla Inc."),
            ("NVDA", "NVIDIA Corporation"),
            ("META", "Meta Platforms Inc."),
            ("CRM", "Salesforce Inc."),
            ("NFLX", "Netflix Inc."),
            ("AMD", "Advanced Micro Devices")
        ]
        
        for sym, name in watchlist_symbols:
            try:
                # Check if asset already exists
                existing_asset = Asset.query.filter_by(symbol=sym).first()
                
                if not existing_asset:
                    # Create the asset if it doesn't exist
                    ticker = yf.Ticker(sym)
                    data = ticker.history(period="1d")
                    
                    if data.empty:
                        print(f"❌ No data for watchlist asset {sym}")
                        continue
                    
                    yf_info = ticker.info
                    custom_info = get_asset_info(sym)
                    
                    sector = yf_info.get("sector", "Unknown").split()[0] if "sector" in yf_info else "Unknown"
                    day_changeP = custom_info['day_changeP']
                    
                    existing_asset = Asset(
                        symbol=sym,
                        name=name,
                        asset_type="equity",
                        sector=sector,
                        day_changeP=day_changeP
                    )
                    db.session.add(existing_asset)
                    db.session.commit()
                
                # Add to watchlist
                watchlist_item = Watchlist(
                    portfolio_id=portfolio.id,
                    asset_id=existing_asset.id,
                    notes=f"Watching {sym} for potential investment opportunities"
                )
                db.session.add(watchlist_item)
                db.session.commit()
                
                print(f"✅ Added {sym} to watchlist")
                
            except Exception as e:
                print(f"❌ Error adding {sym} to watchlist: {e}")
        
        print("✅ Watchlist seeding completed!")


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
            
            # Generate asset history for ALL assets (not just watchlist)
            print("\n🔄 Generating asset history for all assets...")
            all_assets = Asset.query.all()
            
            for asset in all_assets:
                # Check if history already exists
                existing_history = AssetHistory.query.filter_by(asset_id=asset.id).first()
                if existing_history:
                    print(f"ℹ️ Asset {asset.symbol} already has history, skipping...")
                    continue
                
                # Get current price from latest transaction or use a reasonable default
                latest_holding = Holding.query.filter_by(asset_id=asset.id).first()
                real_price = fetch_latest_price(asset.id)
                if real_price:
                    print(f"ℹ️ Fetched real price ${real_price:.2f} for asset {asset.symbol}")
                    current_price = real_price
                else:
                    current_price = latest_holding.purchase_price if latest_holding else 100.0 + random.random() * 200  # Random price between $100-$300

                # Use the asset's day_changeP for realistic recent movement
                generate_asset_history(asset.id, current_price, asset.day_changeP, years=3)
        
        print("🎉 Database seeding completed with portfolio and asset history!")
    else:
        print("Cancelled.")
