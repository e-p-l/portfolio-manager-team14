##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db

class Transaction(db.Model):
    __TRANSACTION_TYPE = ('buy', 'sell', 'dividend', 'split')

    __tablename__       = "transactions"

    # foreign keys
    id                  = db.Column(db.Integer, primary_key=True)
    portfolio_id        = db.Column(db.Integer, db.ForeignKey("portfolios.id", name="fk_portfolios_id"), nullable=False)

    # transaction data
    asset_id            = db.Column(db.Integer, db.ForeignKey("assets.id", name="fk_assets_id"), nullable=False)
    quantity            = db.Column(db.Float, nullable=False)
    price               = db.Column(db.Float, nullable=False)
    created_at          = db.Column(db.DateTime, nullable=False)
    transaction_type    = db.Column(db.String(10), nullable=True)
    fee                 = db.Column(db.Float, nullable=True)
    tax                 = db.Column(db.Float, nullable=True)
    currency            = db.Column(db.String(10), nullable=True)

    # relationships
    portfolio           = db.relationship("Portfolio", back_populates="transactions")
    asset               = db.relationship("Asset", back_populates="transaction")

    def __init__(self, portfolio_id, asset_id, quantity, price, created_at, transaction_type=None, fee=None, tax=None, currency=None):
        self.portfolio_id = portfolio_id
        self.asset_id = asset_id
        self.quantity = quantity
        self.price = price
        self.created_at = created_at
        self.transaction_type = transaction_type
        self.fee = fee
        self.tax = tax
        self.currency = currency

    def serialize(self):
        return {
            'id': self.id,
            'portfolio_id': self.portfolio_id,
            'asset_id': self.asset_id,
            'quantity': self.quantity,
            'price': self.price,
            'created_at': self.created_at.isoformat(),
            'transaction_type': self.transaction_type,
            'fee': self.fee,
            'tax': self.tax,
            'currency': self.currency
        }
