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

def generate_asset_history(asset_id, current_price, day_changeP, years=3):
    """
    Generate realistic price history for an asset based on its current day_changeP.
    If day_changeP is positive, the last 7 days show slight price decreases (profit taking).
    If day_changeP is negative, the last 7 days show slight price increases (recovery).
    """
    from datetime import datetime, timedelta
    import random

    print(f"🔄 Generating {years} years of price history for asset {asset_id}...")

    today = datetime.now().date()
    start_date = today - timedelta(days=years * 365)
    
    # Calculate the price 7 days ago based on current day_changeP logic
    if day_changeP > 0:
        # If today's change is positive, assume the last 7 days had slight declines (profit taking before rally)
        price_7_days_ago = current_price / (1 + (day_changeP / 100)) * (1.02 + random.random() * 0.03)  # 2-5% higher 7 days ago
    else:
        # If today's change is negative, assume the last 7 days had slight increases (before the drop)
        price_7_days_ago = current_price / (1 + (day_changeP / 100)) * (0.96 - random.random() * 0.03)  # 3-4% lower 7 days ago
    
    # Start with a base price at the beginning of the period
    base_price = current_price * (0.3 + random.random() * 0.4)  # 30-70% of current price as starting point
    
    current_date = start_date
    current_price_calc = base_price
    
    history_records = []
    
    while current_date <= today:
        days_since_start = (current_date - start_date).days
        days_until_today = (today - current_date).days
        
        # Phase-based price movement (similar to portfolio but for individual stocks)
        if days_since_start <= 180:  # Initial period
            daily_growth = 0.0008 + random.random() * 0.0004  # 0.08-0.12% daily
            volatility = 0.015
        elif days_since_start <= 365:  # Growth phase
            daily_growth = 0.0012 + random.random() * 0.0008  # 0.12-0.20% daily
            volatility = 0.02
        elif days_since_start <= 400:  # Market correction
            daily_growth = -0.001 - random.random() * 0.0015  # -0.10 to -0.25% daily
            volatility = 0.035
        elif days_since_start <= 600:  # Recovery phase
            daily_growth = 0.002 + random.random() * 0.001  # 0.20-0.30% daily
            volatility = 0.025
        else:  # Mature phase
            daily_growth = 0.001 + random.random() * 0.0005  # 0.10-0.15% daily
            volatility = 0.018
        
        # Special handling for last 7 days based on day_changeP - SUBTLE movements only
        if days_until_today <= 7:
            if day_changeP > 0:
                # Very slight decline leading to today's rally (profit taking before the bounce)
                daily_growth = -0.0003 - random.random() * 0.0005  # -0.03% to -0.08% daily decline (very gentle)
                volatility = 0.008  # Lower volatility for more predictable pattern
            else:
                # Very slight increase before today's drop (building up before the fall)
                daily_growth = 0.0002 + random.random() * 0.0004  # 0.02% to 0.06% daily increase (very gentle)
                volatility = 0.008  # Lower volatility for more predictable pattern
        
        # Apply daily movement
        random_factor = 1 + (random.random() * 2 - 1) * volatility
        growth_factor = 1 + daily_growth
        current_price_calc *= random_factor * growth_factor
        
        # Add some realistic spikes (earnings, news, etc.)
        spike_roll = random.random()
        if spike_roll > 0.996:  # 0.4% chance of big spike
            current_price_calc *= 1.06 + random.random() * 0.08  # 6-14% spike
        elif spike_roll < 0.004:  # 0.4% chance of big drop
            current_price_calc *= 0.88 - random.random() * 0.08  # 8-12% drop
        elif spike_roll > 0.99:  # 1% chance of medium move
            current_price_calc *= 1.02 + random.random() * 0.03 if random.random() > 0.5 else 0.96 - random.random() * 0.03
        
        # Sector-specific events (quarterly earnings simulation)
        month = current_date.month
        day_of_month = current_date.day
        if day_of_month in range(20, 32) and month in [1, 4, 7, 10]:  # Earnings seasons
            if random.random() > 0.93:  # 7% chance during earnings
                earnings_move = (1.03 + random.random() * 0.07) if random.random() > 0.25 else (0.93 - random.random() * 0.06)
                current_price_calc *= earnings_move
        
        # Ensure reasonable price bounds
        if current_price_calc < base_price * 0.2:  # Don't go below 20% of base
            current_price_calc = base_price * (0.2 + random.random() * 0.1)
        if current_price_calc > base_price * 5.0:  # Don't go above 500% of base
            current_price_calc *= 0.95
        
        # Round to 2 decimal places
        final_price = round(current_price_calc, 2)
        
        # Avoid duplicate entries
        existing = AssetHistory.query.filter_by(
            asset_id=asset_id,
            date=current_date
        ).first()
        
        if not existing:
            history_record = AssetHistory(
                asset_id=asset_id,
                price=final_price,
                date=current_date
            )
            history_records.append(history_record)
        
        current_date += timedelta(days=1)
    
    # Adjust the final few days to match the expected pattern
    # Update the last day to match current_price exactly
    if history_records:
        history_records[-1].price = current_price
        
        # Adjust the previous days according to day_changeP pattern - VERY SUBTLE
        if len(history_records) >= 7:
            for i in range(-7, -1):  # Last 7 days excluding today
                record = history_records[i]
                if day_changeP > 0:
                    # Very gradual decline, then rally today (gentle profit taking pattern)
                    decline_factor = 0.9996 - random.random() * 0.0006  # 0.04-0.10% daily decline (very gentle)
                    record.price = round(history_records[i+1].price / decline_factor, 2)
                else:
                    # Very gradual increase, then drop today (gentle buildup pattern)
                    increase_factor = 1.0003 + random.random() * 0.0005  # 0.03-0.08% daily increase (very gentle)
                    record.price = round(history_records[i+1].price / increase_factor, 2)
    
    # Save to database
    if history_records:
        db.session.bulk_save_objects(history_records)
        db.session.commit()
        print(f"✅ Generated {len(history_records)} price history records for asset {asset_id}")

def generate_portfolio_history(portfolio_id, years=3):
    from datetime import datetime, timedelta
    import random

    print(f"🔄 Generating {years} years of portfolio history...")

    base_value = 100000
    today = datetime.now().date()
    start_date = today - timedelta(days=years * 365)

    current_date = start_date
    current_value = base_value

    history_records = []

    while current_date <= today:
        days_since_start = (current_date - start_date).days

        # Phase-based settings
        if days_since_start <= 180:  # Flat start
            daily_growth = 0.0001
            volatility = 0.002
        elif days_since_start <= 365:  # Growth phase
            daily_growth = 0.0005
            volatility = 0.006
        elif days_since_start <= 400:  # CRASH!
            daily_growth = -0.002
            volatility = 0.04
        elif days_since_start <= 600:  # Recovery
            daily_growth = 0.0015
            volatility = 0.01
        else:  # Rally & Calm
            daily_growth = 0.001
            volatility = 0.005

        # Base movement
        random_factor = 1 + (random.random() * 2 - 1) * volatility
        growth_factor = 1 + daily_growth
        current_value *= random_factor * growth_factor

        # Controlled spikiness
        spike_roll = random.random()
        if spike_roll > 0.995:
            current_value *= 1.04 + random.random() * 0.04  # Big up spike
        elif spike_roll < 0.003:
            current_value *= 0.92 - random.random() * 0.05  # Big down
        elif spike_roll > 0.985:
            current_value *= 1.01 + random.random() * 0.015  # Mini rally
        elif spike_roll < 0.015:
            current_value *= 0.985 - random.random() * 0.01  # Mini dip

        # Forced crash during CRASH phase
        if 366 <= days_since_start <= 400 and random.random() < 0.25:
            crash_drop = 0.85 - random.random() * 0.1  # 10–25% drop
            current_value *= crash_drop

        # Recovery surges after crash
        if 401 <= days_since_start <= 600 and random.random() < 0.15:
            recovery_spike = 1.05 + random.random() * 0.08
            current_value *= recovery_spike

        # Quarterly earnings (occasional, light)
        month = current_date.month
        day_of_month = current_date.day
        if day_of_month in range(25, 32) and month in [1, 4, 7, 10]:
            if random.random() > 0.94:
                earnings_spike = (1.04 + random.random() * 0.06) if random.random() > 0.5 else (0.92 - random.random() * 0.06)
                current_value *= earnings_spike

        # Seasonal mild adjustment
        if month in [11, 12]:  # Holiday rally
            current_value *= 1.0005
        elif month in [1, 2]:  # Early year volatility
            current_value *= 0.9995

        # Cap extremes
        if current_value < base_value * 0.7:
            current_value = base_value * (0.7 + random.random() * 0.2)
        if current_value > base_value * 2.5:
            current_value *= 0.95 - random.random() * 0.05

        # Round and compute balance
        current_value = round(current_value, 2)
        cash_percentage = 0.08 + random.random() * 0.04
        current_balance = round(current_value * cash_percentage, 2)

        # Avoid duplicate entries
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

    # Save to DB
    if history_records:
        db.session.bulk_save_objects(history_records)
        db.session.commit()
        print(f"✅ Generated {len(history_records)} records")
        print(f"📈 Portfolio range: ${min([r.value for r in history_records]):,.2f} - ${max([r.value for r in history_records]):,.2f}")
    else:
        print("ℹ️ No new records to generate (already exists)")


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
            
            # Generate asset history for all watchlist assets
            print("\n🔄 Generating asset history for watchlist items...")
            watchlist_assets = db.session.query(Asset).join(Watchlist, Asset.id == Watchlist.asset_id).distinct().all()
            
            for asset in watchlist_assets:
                # Get current price from latest transaction or use a reasonable default
                latest_holding = Holding.query.filter_by(asset_id=asset.id).first()
                current_price = latest_holding.purchase_price if latest_holding else 100.0 + random.random() * 200  # Random price between $100-$300
                
                # Use the asset's day_changeP for realistic recent movement
                generate_asset_history(asset.id, current_price, asset.day_changeP, years=3)
        
        print("🎉 Database seeding completed with portfolio and asset history!")
    else:
        print("Cancelled.")
