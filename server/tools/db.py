import sys
import os
from datetime import datetime
import argparse

# Make sure app/ is importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models.asset import Asset
from app.models.portfolio import Portfolio
from app.models.transaction import Transaction

app = create_app()

def init_database():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("✅ Database initialized.")

def seed_data():
    # TODO: Fill tables with sample data
    print("Seeding is not implemented yet.")
    pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Database utility for Portfolio Manager.")
    parser.add_argument("command", choices=["init", "seed", "all"], help="Command to run")

    args = parser.parse_args()

    if args.command == "init":
        init_database()
    elif args.command == "seed":
        seed_data()
    elif args.command == "all":
        init_database()
        seed_data()
