from app import db

from datetime import date

class AssetHistory(db.Model):
    __tablename__ = "asset_history"

    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id", name="fk_asset_history_asset_id"), nullable=False)
    price = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)

    asset = db.relationship("Asset", back_populates="history")

    def __init__(self, asset_id, price, date=None):
        self.asset_id = asset_id
        self.price = price
        self.date = date or date.today()

    def serialize(self):
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "asset_symbol": self.asset.symbol,
            "price": self.price,
            "date": self.date.isoformat()
        }