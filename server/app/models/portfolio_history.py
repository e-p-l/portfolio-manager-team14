from app import db

from datetime import date

class PortfolioHistory(db.Model):
    __tablename__ = 'portfolio_history'

    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), name='fk_portfolio_history_portfolio_id', nullable=False)
    value = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)

    portfolio = db.relationship('Portfolio', back_populates='history')

    def __init__(self, portfolio_id, value, date=None):
        self.portfolio_id = portfolio_id
        self.value = value
        self.date = date or date.today()

    def serialize(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "value": self.value,
            "balance": self.balance,
            "date": self.date.isoformat()
        }
