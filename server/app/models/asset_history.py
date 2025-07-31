from app import db

from datetime import datetime, timezone

class AssetHistory(db.Model):
    __tablename__ = "asset_history"

    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id", name="fk_asset_history_asset_id"), nullable=False)
    price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    asset = db.relationship("Asset", back_populates="history")

    def __init__(self, asset_id, price, timestamp=None):
        self.asset_id = asset_id
        self.price = price
        self.timestamp = timestamp or datetime.now(timezone.utc)

    def serialize(self):
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "asset_symbol": self.asset.symbol,
            "price": self.price,
            "timestamp": self.timestamp.isoformat()
        }