"""
Seeding utility functions for generating historical data.
Separated from seed_db.py for better organization and reusability.
"""

import random
from datetime import datetime, timedelta
from app import db
from app.models.portfolio_history import PortfolioHistory
from app.models.asset_history import AssetHistory
from app.models.holding import Holding


def generate_portfolio_history(portfolio_id, years=3):
    """Generate realistic portfolio value history over time."""
    print(f"🔄 Generating {years} years of portfolio history...")

    # Calculate REAL current portfolio value from actual holdings
    from app.services.asset_service import fetch_latest_price
    
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).filter(Holding.quantity > 0).all()
    real_portfolio_value = 0.0
    for holding in holdings:
        if holding.purchase_price:
            real_portfolio_value += holding.quantity * holding.purchase_price
    
    # If no holdings, use default base value
    if real_portfolio_value == 0:
        real_portfolio_value = 100000
    
    print(f"🎯 Real portfolio value (sum of holdings): ${real_portfolio_value:,.2f}")

    # Generate your beautiful random history (UNCHANGED!)
    base_value = 100000
    today = datetime.now().date()
    start_date = today - timedelta(days=years * 365)

    current_date = start_date
    current_value = base_value

    history_records = []

    while current_date <= today:
        days_since_start = (current_date - start_date).days

        # Phase-based settings (UNCHANGED - keeping your beautiful spikiness!)
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

        # Base movement (UNCHANGED - keeping randomness!)
        random_factor = 1 + (random.random() * 2 - 1) * volatility
        growth_factor = 1 + daily_growth
        current_value *= random_factor * growth_factor

        # Controlled spikiness (UNCHANGED - keeping your spikes!)
        spike_roll = random.random()
        if spike_roll > 0.995:
            current_value *= 1.04 + random.random() * 0.04  # Big up spike
        elif spike_roll < 0.003:
            current_value *= 0.92 - random.random() * 0.05  # Big down
        elif spike_roll > 0.985:
            current_value *= 1.01 + random.random() * 0.015  # Mini rally
        elif spike_roll < 0.015:
            current_value *= 0.985 - random.random() * 0.01  # Mini dip

        # Forced crash during CRASH phase (UNCHANGED)
        if 366 <= days_since_start <= 400 and random.random() < 0.25:
            crash_drop = 0.85 - random.random() * 0.1  # 10–25% drop
            current_value *= crash_drop

        # Recovery surges after crash (UNCHANGED)
        if 401 <= days_since_start <= 600 and random.random() < 0.15:
            recovery_spike = 1.05 + random.random() * 0.08
            current_value *= recovery_spike

        # Quarterly earnings (UNCHANGED)
        month = current_date.month
        day_of_month = current_date.day
        if day_of_month in range(25, 32) and month in [1, 4, 7, 10]:
            if random.random() > 0.94:
                earnings_spike = (1.04 + random.random() * 0.06) if random.random() > 0.5 else (0.92 - random.random() * 0.06)
                current_value *= earnings_spike

        # Seasonal mild adjustment (UNCHANGED)
        if month in [11, 12]:  # Holiday rally
            current_value *= 1.0005
        elif month in [1, 2]:  # Early year volatility
            current_value *= 0.9995

        # Cap extremes (UNCHANGED)
        if current_value < base_value * 0.7:
            current_value = base_value * (0.7 + random.random() * 0.2)
        if current_value > base_value * 2.5:
            current_value *= 0.95 - random.random() * 0.05

        # Store the RAW generated value (before scaling)
        raw_value = round(current_value, 2)
        cash_percentage = 0.08 + random.random() * 0.04

        # Avoid duplicate entries
        existing = PortfolioHistory.query.filter_by(
            portfolio_id=portfolio_id,
            date=current_date
        ).first()

        if not existing:
            history_record = PortfolioHistory(
                portfolio_id=portfolio_id,
                value=raw_value,  # Store raw value temporarily
                balance=round(raw_value * cash_percentage, 2),
                date=current_date
            )
            history_records.append(history_record)

        current_date += timedelta(days=1)

    # Calculate scaling ratio: real_portfolio_value / generated_final_value
    if history_records:
        generated_final_value = history_records[-1].value  # Last day's generated value
        scaling_ratio = real_portfolio_value / generated_final_value
        
        print(f"📊 Generated final value: ${generated_final_value:,.2f}")
        print(f"🔄 Scaling ratio: {scaling_ratio:.6f}")
        
        # Scale ALL history values by the ratio
        for record in history_records:
            record.value = round(record.value * scaling_ratio, 2)
            record.balance = round(record.balance * scaling_ratio, 2)
        
        print(f"✅ Scaled to match real portfolio value: ${history_records[-1].value:,.2f}")

    # Save to DB
    if history_records:
        db.session.bulk_save_objects(history_records)
        db.session.commit()
        print(f"✅ Generated {len(history_records)} portfolio history records")
        print(f"📈 Portfolio range: ${min([r.value for r in history_records]):,.2f} - ${max([r.value for r in history_records]):,.2f}")
    else:
        print("ℹ️ No new portfolio records to generate (already exists)")


def generate_asset_history(asset_id, current_price, day_changeP, years=3):
    """
    Generate realistic price history for an asset based on its current day_changeP.
    If day_changeP is positive, the last 7 days show slight price decreases (profit taking).
    If day_changeP is negative, the last 7 days show slight price increases (recovery).
    """
    print(f"🔄 Generating {years} years of price history for asset {asset_id}...")

    today = datetime.now().date()
    start_date = today - timedelta(days=years * 365)
    
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
    else:
        print("ℹ️ No new asset records to generate (already exists)")


def generate_asset_history_for_new_watchlist_item(asset_id, asset_symbol=None):
    """
    Generate asset history for a newly added watchlist item.
    This is called when adding an asset to watchlist for the first time.
    """
    from app.models.asset import Asset
    
    try:
        # Get the asset details
        asset = Asset.query.get(asset_id)
        if not asset:
            print(f"❌ Asset with ID {asset_id} not found")
            return
        
        # Check if history already exists
        existing_history = AssetHistory.query.filter_by(asset_id=asset_id).first()
        if existing_history:
            print(f"ℹ️ Asset history already exists for {asset.symbol}")
            return
        
        # Get current price from holdings or use a reasonable default
        latest_holding = Holding.query.filter_by(asset_id=asset_id).first()
        if latest_holding:
            current_price = latest_holding.purchase_price
        else:
            # Generate a reasonable price based on asset type and symbol
            if asset.symbol in ['NVDA', 'TSLA']:
                current_price = 200 + random.random() * 600  # $200-800 for high-value stocks
            elif asset.symbol in ['AAPL', 'MSFT', 'GOOGL', 'AMZN']:
                current_price = 100 + random.random() * 300  # $100-400 for major stocks
            else:
                current_price = 50 + random.random() * 150   # $50-200 for other stocks
        
        # Generate 3 years of history
        generate_asset_history(asset_id, current_price, asset.day_changeP, years=3)
        
        print(f"✅ Successfully generated asset history for {asset.symbol} (ID: {asset_id})")
        
    except Exception as e:
        print(f"❌ Error generating asset history for asset {asset_id}: {e}")
        # Don't raise the exception to avoid breaking the watchlist addition
