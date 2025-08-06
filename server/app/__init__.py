import os
from flask import Flask, app
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    CORS(app, resources={r"/*": {"origins": "*"}})

    # app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(app.root_path, 'investment_tracker.db')}"
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:password@localhost:3306/portfolio_manager_db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "dev"

    db.init_app(app)

    from flask_restx import Api
    api = Api(app, doc='/swagger')

    from .routes.assets import api_ns as assets_api_ns
    api.add_namespace(assets_api_ns, path='/assets')

    from .routes.portfolios import api_ns as portfolios_api_ns
    api.add_namespace(portfolios_api_ns, path='/portfolios')

    from .routes.holdings import api_ns as holdings_api_ns
    api.add_namespace(holdings_api_ns, path='/holdings')

    from .routes.transactions import api_ns as transactions_api_ns
    api.add_namespace(transactions_api_ns, path='/transactions')

    from .routes.watchlist import api_ns as watchlist_api_ns
    api.add_namespace(watchlist_api_ns, path='/watchlist')

    from .routes.insights import api_ns as watchlist_api_ns
    api.add_namespace(watchlist_api_ns, path='/insigths')

    return app
