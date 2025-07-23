##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db

class Transaction(db.Model):
    __tablename__       = "transactions"

    # foreign keys
    id                  = db.Column(db.Integer, primary_key=True)
    portfolio_id        = db.Column(db.Integer, db.ForeignKey("portfolios.id"), nullable=False)

    # transaction data
    asset_id            = db.Column(db.Integer, db.ForeignKey("assets.id"), nullable=False)
    quantity            = db.Column(db.Float, nullable=False)
    price               = db.Column(db.Float, nullable=False)
    date                = db.Column(db.Date, nullable=False)
    transaction_type    = db.Column(db.String(10), nullable=False)

    portfolio           = db.relationship("Portfolio", back_populates="transactions")
    asset               = db.relationship("Asset", back_populates="transactions")

    def __init__(self, portfolio_id, asset_id, quantity, price, date, transaction_type):
        self.portfolio_id = portfolio_id
        self.asset_id = asset_id
        self.quantity = quantity
        self.price = price
        self.date = date
        self.transaction_type = transaction_type

    def serialize(self):
        return {"id": self.id, 
                "portfolio_id": self.portfolio_id,
                "asset_id": self.asset_id,
                "quantity": self.quantity,
                "price": self.price,
                "date": self.date,
                }

