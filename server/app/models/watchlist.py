######################################################
#
# A watchlist represents assets a user wants to track.
#
######################################################

from app import db
from datetime import datetime, timezone

class Watchlist(db.Model):
    __tablename__ = "watchlist"

    # primary key
    id = db.Column(db.Integer, primary_key=True)

    # watchlist data
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id', name="fk_watchlist_portfolio_id"), nullable=False)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id', name="fk_watchlist_asset_id"), nullable=False)
    added_date = db.Column(db.DateTime, nullable=False)

    # relationships
    portfolio = db.relationship('Portfolio', backref='watchlist_items')
    asset = db.relationship('Asset', backref='watched_by')

    # Ensure unique combination of portfolio_id and asset_id (can't watch same asset twice in same portfolio)
    __table_args__ = (db.UniqueConstraint('portfolio_id', 'asset_id', name='uq_portfolio_asset_watchlist'),)

    def __init__(self, portfolio_id, asset_id, notes=None, added_date=None):
        self.portfolio_id = portfolio_id
        self.asset_id = asset_id
        self.added_date = added_date or datetime.now(timezone.utc)

    def serialize(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "asset_id": self.asset_id,
            "added_date": self.added_date.isoformat(),
            "asset_symbol": self.asset.symbol if self.asset else None,
            "asset_name": self.asset.name if self.asset else None,
            "asset_type": self.asset.asset_type if self.asset else None,
            "asset_sector": self.asset.sector if self.asset else None,
            "day_changeP": self.asset.day_changeP if self.asset and hasattr(self.asset, "day_changeP") else None
        }
