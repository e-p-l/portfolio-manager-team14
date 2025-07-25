from app.models.portfolio import Portfolio
from app.models.holding import Holding
from app.models.asset import Asset
from app import db

def calculate_portfolio_value(portfolio_id: int) -> float:
    """
    Returns the total market value of a portfolio by summing current value of all holdings.
    Uses Asset.current_price for calculation.
    """
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return None
    
    total_value = 0.0
    for holding in portfolio.holdings:
        asset = Asset.query.get(holding.asset_id)
        if asset and asset.current_price is not None:
            total_value += holding.quantity * asset.current_price
    return total_value

def asset_allocation(portfolio_id: int):
    """
    Returns asset allocation breakdown by asset_type for a portfolio.
    """
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return None

    allocation = {}
    total_value = calculate_portfolio_value(portfolio_id)
    if not total_value:
        return {}

    for holding in portfolio.holdings:
        asset = Asset.query.get(holding.asset_id)
        if asset and asset.current_price is not None:
            value = holding.quantity * asset.current_price

            if asset.asset_type not in allocation:
                allocation[asset.asset_type] = 0.0
            else:
                allocation[asset.asset_type] += value

    # Convert to percentage
    for type in allocation:
        allocation[type] = round((allocation[type] / total_value) * 100, 2)

    return allocation