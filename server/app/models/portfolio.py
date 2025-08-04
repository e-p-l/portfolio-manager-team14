##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db

class Portfolio(db.Model):
    __tablename__   = "portfolios"

    # primary key
    id              = db.Column(db.Integer, primary_key=True)

    # portfolio data
    name            = db.Column(db.String(100), nullable=False)
    balance        = db.Column(db.Float, default=0.0)

    # relationships
    holdings        = db.relationship("Holding", back_populates="portfolio")
    transactions    = db.relationship("Transaction", back_populates="portfolio")
    history         = db.relationship("PortfolioHistory", back_populates="portfolio")
    
    def __init__(self, name):
        self.name = name
        self.balance = 10000.0

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "balance": self.balance,
        }
