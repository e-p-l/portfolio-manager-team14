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
    portfolio.balance += pnl
    db.session.commit()

def sell_holding(holding_id, quantity, sell_price):
    """
    Sells a quantity from a holding, computes PnL, and updates portfolio balance.
    """
    holding = Holding.query.get(holding_id)
    if not holding:
        raise ValueError("Holding not found.")

    if quantity > holding.quantity:
        raise ValueError("Cannot sell more than holding quantity.")

    pnl = compute_pnl_from_sell(holding, quantity, sell_price)

    holding.quantity -= quantity
    db.session.commit()

    portfolio = Portfolio.query.get(holding.portfolio_id)
    update_portfolio_balance(portfolio, pnl)

    return pnl

def buy_holding(portfolio_id, asset_id, quantity, purchase_price):
    """
    Buys a holding by creating a new Holding record.
    """
    holding = Holding(
        portfolio_id=portfolio_id,
        asset_id=asset_id,
        quantity=quantity,
        purchase_price=purchase_price
    )
    db.session.add(holding)
    db.session.commit()
    return holding