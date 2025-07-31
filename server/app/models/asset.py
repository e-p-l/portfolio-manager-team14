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
    asset_type      = db.Column(db.String(50), nullable=False)
    sector          = db.Column(db.String(100), nullable=False)

    # relationships
    holdings       = db.relationship("Holding", back_populates="asset")
    history        = db.relationship("AssetHistory", back_populates="asset", cascade="all, delete-orphan")

    def __init__(self, symbol, name, asset_type, sector):
        self.symbol = symbol
        self.name = name
        self.asset_type = asset_type
        self.sector = sector

    def serialize(self):
        return {
            "id": self.id,
            "symbol": self.symbol,
            "name": self.name,
            "asset_type": self.asset_type,
            "sector": self.sector,
        }