from app import db

class PortfolioValue(db.Model):
    __tablename__ = 'portfolio_values'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    value = db.Column(db.Float, nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('date', 'portfolio_id', name='unique_date_portfolio'),
    )

    def serialize(self):
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "value": self.value,
            "portfolio_id": self.portfolio_id
        }
