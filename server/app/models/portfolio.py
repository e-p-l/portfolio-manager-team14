##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db

from datetime import date

class Portfolio(db.Model):
    __tablename__   = "portfolios"

    _INIT_BALANCE = 10000.0

    # primary key
    id              = db.Column(db.Integer, primary_key=True)

    # portfolio data
    name            = db.Column(db.String(100), nullable=False)
    balance         = db.Column(db.Float, default=0.0)
    creation_date   = db.Column(db.Date, nullable=False)

    # relationships
    holdings        = db.relationship("Holding", back_populates="portfolio")
    transactions    = db.relationship("Transaction", back_populates="portfolio")
    history         = db.relationship("PortfolioHistory", back_populates="portfolio")
    
    def __init__(self, name):
        self.name = name
        self.balance = self._INIT_BALANCE
        self.creation_date = date.today()

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "balance": self.balance,
        }
