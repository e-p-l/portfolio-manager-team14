##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db
from datetime import datetime

class Portfolio(db.Model):
    __tablename__   = "portfolios"

    # primary key
    id              = db.Column(db.Integer, primary_key=True)

    # portfolio data
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id', name="fk_users_id"), nullable=False)
    name            = db.Column(db.String(100), nullable=False)
    created_at      = db.Column(db.DateTime, nullable=False)
    updated_at      = db.Column(db.DateTime, nullable=False)
    description     = db.Column(db.String(255), nullable=True)

    # relationships
    user            = db.relationship("User", back_populates="portfolios")
    holdings        = db.relationship("Holding", back_populates="portfolio")
    transactions    = db.relationship("Transaction", back_populates="portfolio")
    
    def __init__(self, user_id, name, description=None):
        self.user_id = user_id
        self.name = name
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.description = description

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "description": self.description,
        }
