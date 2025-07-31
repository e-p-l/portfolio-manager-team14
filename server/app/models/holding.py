######################################################
#
# A holding represents an asset owned in a portfolio.
#
######################################################

from app import db

from datetime import datetime, timezone

class Holding(db.Model):
    __tablename__   = "holdings"

    # primary key
    id              = db.Column(db.Integer, primary_key=True)

    # holding data
    portfolio_id    = db.Column(db.Integer, db.ForeignKey('portfolios.id', name="fk_holdings_portfolio_id"), nullable=False)
    asset_id        = db.Column(db.Integer, db.ForeignKey('assets.id', name="fk_holdings_asset_id"), nullable=False)
    quantity        = db.Column(db.Float, nullable=False)
    purchase_price  = db.Column(db.Float, nullable=False)
    purchase_date   = db.Column(db.DateTime, nullable=False)

    # relationships
    portfolio = db.relationship('Portfolio', back_populates='holdings')
    asset = db.relationship('Asset', back_populates='holdings')
    transactions = db.relationship('Transaction', back_populates='holding')

    def __init__(self, portfolio_id, asset_id, quantity, purchase_price, purchase_date=None):
        self.portfolio_id = portfolio_id
        self.asset_id = asset_id
        self.quantity = quantity
        self.purchase_price = purchase_price
        self.purchase_date = purchase_date or datetime.now(timezone.utc)

    def serialize(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "asset_id": self.asset_id,
            "quantity": self.quantity,
            "purchase_price": self.purchase_price,
            "purchase_date": self.purchase_date.isoformat(),
            "asset_symbol": self.asset.symbol if self.asset else None,
            "asset_name": self.asset.name if self.asset else None,
            "asset_type": self.asset.asset_type if self.asset else None,
            "asset_sector": self.asset.sector if self.asset else None,
            "day_changeP": self.asset.day_changeP if self.asset and hasattr(self.asset, "day_changeP") else None
        }
