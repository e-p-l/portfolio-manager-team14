##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db

class Portfolio(db.Model):
    __tablename__ = "portfolios"

    # primary key
    id = db.Column(db.Integer, primary_key=True)

    # attributes
    name = db.Column(db.String(100), nullable=False)

    # relationships
    transactions = db.relationship("Transaction", back_populates="portfolio")
