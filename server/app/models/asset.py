##################################################
#
# This is a sample model. Data modelling is TBD.
#
##################################################

from app import db

class Asset(db.Model):
    _VALID_TYPES = { 'stock', 'bonds' }

    __tablename__   = "assets"

    id              = db.Column(db.Integer, primary_key=True)

    # asset data
    symbol          = db.Column(db.String(10), unique=True, nullable=False)
    name            = db.Column(db.String(100))
    asset_type      = db.Column(db.String(50), nullable=True)

    # relationships
    transactions    = db.relationship("Transaction", back_populates="asset")

    def __init__(self, symbol, name, asset_type):
        self.symbol = symbol
        self.name = name
        self.asset_type = asset_type

    def serialize(self):
        return {"id": self.id, 
                "symbol": self.symbol, 
                "name": self.name,
                "asset_type": self.asset_type
                }

    @classmethod
    def create(cls, symbol, name, asset_type):
        cls._validate_type(asset_type)
        return cls(
                symbol=symbol,
                name=name,
                asset_type=asset_type,
                )

    @classmethod
    def _validate_type(cls, asset_type):
        if asset_type not in cls._VALID_TYPES:
            raise ValueError(f"Invalid asset type: {asset_type}")
