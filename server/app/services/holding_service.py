from app import db
from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.models.transaction import Transaction

from datetime import datetime, timezone

def compute_pnl_from_sell(holding, quantity, sell_price):
    """
    Computes PnL for the sold quantity.
    """
    pnl = (sell_price - holding.purchase_price) * quantity
    
    return pnl

def update_portfolio_balance(portfolio, pnl):
    """
    Updates the portfolio's balance by adding the PnL.
    """
    print(f"Updating balance: Current={portfolio.balance}, PnL={pnl}")
    portfolio.balance += pnl
    db.session.commit()
    print(f"New balance: {portfolio.balance}")

def sell_holding(holding_id, quantity, sell_price):
    """
    Sells a quantity from a holding and updates portfolio balance with sale proceeds.
    """
    holding = Holding.query.get(holding_id)
    if not holding:
        raise ValueError("Holding not found.")

    if quantity > holding.quantity:
        raise ValueError("Cannot sell more than holding quantity.")

    # Store values before modifying
    portfolio_id = holding.portfolio_id
    original_quantity = holding.quantity
    
    # Calculate sale proceeds (what you get back)
    sale_proceeds = sell_price * quantity
    
    # Calculate PnL for record keeping (optional)
    pnl = (sell_price - holding.purchase_price) * quantity
    print(f"Sale proceeds: {sell_price} * {quantity} = {sale_proceeds}")
    print(f"PnL: ({sell_price} - {holding.purchase_price}) * {quantity} = {pnl}")
    
    # Update holding quantity
    holding.quantity -= quantity
    remaining_quantity = holding.quantity
    
    print(f"Holding quantity: {original_quantity} -> {remaining_quantity}")
    
    # Commit the quantity change
    db.session.commit()

    # Add sale proceeds to portfolio balance (this is your money back!)
    portfolio = Portfolio.query.get(portfolio_id)
    if portfolio:
        print(f"Updating balance: Current={portfolio.balance}, Adding proceeds={sale_proceeds}")
        portfolio.balance += sale_proceeds  # Add the full sale amount
        db.session.commit()
        print(f"New balance: {portfolio.balance}")
    else:
        raise ValueError("Portfolio not found.")

    return sale_proceeds, remaining_quantity

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