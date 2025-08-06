from app import db
from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.models.transaction import Transaction

from datetime import datetime, timezone

from app.services.asset_service import fetch_latest_price

def update_portfolio_balance(portfolio, pnl):
    """
    Updates the portfolio's balance by adding the PnL.
    """
    print(f"Updating balance: Current={portfolio.balance}, PnL={pnl}")
    portfolio.balance += pnl
    db.session.commit()
    print(f"New balance: {portfolio.balance}")

def buy_asset(portfolio_id, asset_id, quantity, latest_price):
    """
    Buys a certain quantity of an asset, creating a new holding in the process.
    """
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        raise ValueError("Portfolio not found.")

    cost = quantity * latest_price
    if portfolio.balance < cost:
        raise ValueError("Insufficient balance in portfolio.")
    
    holding = Holding(
        portfolio_id=portfolio_id,
        asset_id=asset_id,
        quantity=quantity,
        purchase_price=latest_price
    )
    db.session.add(holding)
    db.session.commit()

    update_portfolio_balance(portfolio, -cost)

    transaction = Transaction(
        portfolio_id=portfolio_id,
        holding_id=holding.id,
        quantity=quantity,
        price=latest_price,
        created_at=datetime.now(timezone.utc),
        transaction_type='buy'
    )

    db.session.add(transaction)
    db.session.commit()

    return transaction

def sell_asset(portfolio_id, asset_id, quantity, latest_price):
    """
    Sells a certain quantity of an asset across possibly multiple holdings.
    """
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id, asset_id=asset_id).filter(Holding.quantity > 0).order_by(Holding.purchase_date.asc()).all()

    # compute total available quantity
    total_quantity = 0
    for h in holdings:
        total_quantity += h.quantity
    
    if quantity > total_quantity:
        raise ValueError("Cannot sell more than total holding quantity.")

    portfolio = Portfolio.query.get(portfolio_id)   
    if not portfolio:
        raise ValueError("Portfolio not found.") 

    # sell from holdings in FIFO order
    remaining_to_sell = quantity
    total_sale_proceeds = 0.0
    transactions = []

    for h in holdings:
        if remaining_to_sell <= 0:
            break
        
        # compute sale proceeds for the quantity sold from this holding
        sell_quantity = min(h.quantity, remaining_to_sell)
        sale_proceeds = sell_quantity * latest_price
        total_sale_proceeds += sale_proceeds

        # update holding quantity
        h.quantity -= sell_quantity

        # create transaction record for this holding sale
        transaction = Transaction(
            portfolio_id=portfolio_id,
            holding_id=h.id,
            quantity=sell_quantity,
            price=latest_price,
            created_at=datetime.now(timezone.utc),
            transaction_type='sell'
        )
        db.session.add(transaction)
        db.session.commit()

        transactions.append(transaction)
        remaining_to_sell -= sell_quantity

    # Add total sale proceeds to portfolio balance
    portfolio.balance += total_sale_proceeds
    db.session.commit()
    
    print(f"Total sale proceeds added to portfolio: {total_sale_proceeds}")
    print(f"Portfolio new balance: {portfolio.balance}")
    
    return transactions

def get_asset_return(portfolio_id, asset_id):
    """
    asset_return = (current_value - total_cost) / total_cost
    """
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id, asset_id=asset_id).filter(Holding.quantity > 0).all()

    total_quantity = 0
    total_cost = 0.0
    for h in holdings:
        total_quantity += h.quantity
        total_cost += h.quantity * h.purchase_price
    
    if total_cost == 0:
        return 0.0

    current_value = total_quantity * fetch_latest_price(asset_id)

    return (current_value - total_cost) / total_cost

def get_portfolio_aum(portfolio_id):
    """
    AUM = sum of (quantity of each holding × current price of each asset) + portfolio cash balance
    """
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).filter(Holding.quantity > 0).all()

    aum = 0.0

    for h in holdings:
        aum += h.quantity * fetch_latest_price(h.asset_id)
    
    # TODO: Commented out since deposite/withdrawal from balance is not implemented
    return aum + Portfolio.query.get(portfolio_id).balance
    # return aum

def get_portfolio_return(portfolio_id):
    """
    portfolio_return = (current_value - total_invested) / total_invested
    """
    portfolio = Portfolio.query.get(portfolio_id)

    total_invested = 0.0
    for t in portfolio.transactions:
        if t.transaction_type == 'buy':
            total_invested += t.quantity * t.price
    
    if total_invested == 0:
        return 0.0

    current_value = get_portfolio_aum(portfolio_id)

    return (current_value - total_invested) / total_invested
