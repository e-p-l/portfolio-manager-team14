from app import db
from app.models.holding import Holding
from app.models.portfolio import Portfolio

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

def buy_holding(portfolio_id, asset_id, quantity, purchase_price):
    """
    Buys a holding by creating a new Holding record.
    """
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        raise ValueError("Portfolio not found.")

    cost = quantity * purchase_price
    if portfolio.balance < cost:
        raise ValueError("Insufficient balance in portfolio.")
    
    holding = Holding(
        portfolio_id=portfolio_id,
        asset_id=asset_id,
        quantity=quantity,
        purchase_price=purchase_price
    )
    db.session.add(holding)
    db.session.commit()

    portfolio.balance -= cost
    db.session.commit()

    return holding