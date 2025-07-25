##################################################################
#
# An asset represents a financial instrument that can be traded.
#
##################################################################

from app import db

class Asset(db.Model):
    __ASSET_TYPES = ('stock', 'bond', 'crypto')    

    __tablename__   = "assets"

    # primary key
    id              = db.Column(db.Integer, primary_key=True)

    # asset data
    symbol          = db.Column(db.String(10), unique=True, nullable=False)
    name            = db.Column(db.String(100), nullable=False)
    asset_type      = db.Column(db.String(50), nullable=True)
    exchange        = db.Column(db.String(50), nullable=True)
    sector          = db.Column(db.String(50), nullable=True)
    current_price   = db.Column(db.Float, nullable=True)

    # relationships
    transaction    = db.relationship("Transaction", back_populates="asset")
    holding        = db.relationship("Holding", back_populates="asset")
    price_history = db.relationship("AssetPriceHistory", back_populates="asset")

    def __init__(self, symbol, name, asset_type=None, exchange=None, sector=None, current_price=None):
        self.symbol = symbol
        self.name = name
        self.asset_type = asset_type
        self.exchange = exchange
        self.sector = sector
        self.current_price = current_price

    def serialize(self):
        return {
            "id": self.id,
            "symbol": self.symbol,
            "name": self.name,
            "asset_type": self.asset_type,
            "exchange": self.exchange,
            "sector": self.sector,
            "current_price": self.current_price,
        }

class AssetPriceHistory(db.Model):
    __tablename__ = "asset_price_history"

    # primary key
    id = db.Column(db.Integer, primary_key=True)

    # asset data
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id", name="fk_assets_id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    price = db.Column(db.Float, nullable=False)

    # relationships
    asset = db.relationship("Asset", back_populates="price_history")

    def serialize(self):
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "date": self.date.isoformat(),
            "price": self.price,
        }
