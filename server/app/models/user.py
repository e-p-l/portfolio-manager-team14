##################################################################
#
# A user represents an individual who can own portfolios.
#
##################################################################

from app import db

class User(db.Model):
    
    __tablename__ = "users"

    # primary key
    id = db.Column(db.Integer, primary_key=True)

    # user data
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # relationships
    portfolios = db.relationship("Portfolio", back_populates="user")

    def __init__(self, name, email, password_hash):
        self.name = name
        self.email = email
        self.password_hash = password_hash
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email
        }