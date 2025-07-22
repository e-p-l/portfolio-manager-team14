##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db

class Transaction(db.Model):
    __tablename__ = "transactions"

    # primary key
    id = db.Column(db.Integer, primary_key=True)

    # foreign keys
    portfolio_id = db.Column(db.Integer, db.ForeignKey("portfolios.id"), nullable=False)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id"), nullable=False)

    # attributes
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)

    # relationships
    portfolio = db.relationship("Portfolio", back_populates="transactions")
    asset = db.relationship("Asset", back_populates="transactions")
