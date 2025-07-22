##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db

class Asset(db.Model):
    __tablename__ = "assets"

    # primary key
    id = db.Column(db.Integer, primary_key=True)

    # attributes
    symbol = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100))

    # relationships
    transactions = db.relationship("Transaction", back_populates="asset")
