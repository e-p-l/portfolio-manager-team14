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

    # relationships
    transaction    = db.relationship("Transaction", back_populates="asset")
    holding        = db.relationship("Holding", back_populates="asset")

    def __init__(self, symbol, name, asset_type=None, exchange=None, sector=None):
        self.symbol = symbol
        self.name = name
        self.asset_type = asset_type
        self.exchange = exchange
        self.sector = sector

    def serialize(self):
        return {
            "id": self.id,
            "symbol": self.symbol,
            "name": self.name,
            "asset_type": self.asset_type,
            "exchange": self.exchange,
            "sector": self.sector
        }
