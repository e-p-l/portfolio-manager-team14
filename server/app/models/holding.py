######################################################
#
# A holding represents an asset owned in a portfolio.
#
######################################################

from app import db

class Holding(db.Model):
    __tablename__   = "holdings"

    # primary key
    id              = db.Column(db.Integer, primary_key=True)

    # holding data
    portfolio_id    = db.Column(db.Integer, db.ForeignKey('portfolios.id', name="fk_portfolios_id"), nullable=False)
    asset_id        = db.Column(db.Integer, db.ForeignKey('assets.id', name="fk_assets_id"), nullable=False)
    quantity        = db.Column(db.Float, nullable=False)
    purchase_price  = db.Column(db.Float, nullable=False)

    # relationships
    portfolio = db.relationship('Portfolio', back_populates='holdings')
    asset = db.relationship('Asset', back_populates='holding')

    def __init__(self, portfolio_id, asset_id, quantity, purchase_price):
        self.portfolio_id = portfolio_id
        self.asset_id = asset_id
        self.quantity = quantity
        self.purchase_price = purchase_price

    def serialize(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "asset_id": self.asset_id,
            "quantity": self.quantity,
            "purchase_price": self.purchase_price,
        }
