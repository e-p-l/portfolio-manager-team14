##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from datetime import datetime, timezone

from app import db

class Transaction(db.Model):
    __TRANSACTION_TYPE = ('buy', 'sell', 'dividend', 'split')

    __tablename__       = "transactions"

    # foreign keys
    id                  = db.Column(db.Integer, primary_key=True)
    portfolio_id        = db.Column(db.Integer, db.ForeignKey("portfolios.id", name="fk_transactions_portfolios_id"), nullable=False)
    holding_id            = db.Column(db.Integer, db.ForeignKey("holdings.id", name="fk_transactions_holdings_id"), nullable=False)

    # transaction data
    quantity            = db.Column(db.Float, nullable=False)
    price               = db.Column(db.Float, nullable=False)
    created_at          = db.Column(db.DateTime, nullable=False)
    transaction_type    = db.Column(db.String(10), nullable=False)

    # relationships
    portfolio           = db.relationship("Portfolio", back_populates="transactions")
    holding             = db.relationship("Holding", back_populates="transactions")   

    def __init__(self, portfolio_id, holding_id, quantity, price, transaction_type, created_at=None):
        self.portfolio_id = portfolio_id
        self.holding_id = holding_id
        self.quantity = quantity
        self.price = price
        self.created_at = created_at or datetime.now(timezone.utc).isoformat()
        self.transaction_type = transaction_type

    def serialize(self):
        return {
            'id': self.id,
            'portfolio_id': self.portfolio_id,
            'holding_id': self.holding_id,
            'quantity': self.quantity,
            'price': self.price,
            'created_at': self.created_at.isoformat(),
            'transaction_type': self.transaction_type,
        }
