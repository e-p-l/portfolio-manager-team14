from ..services.insights_service import fetch_latest_news_from_alphavantage, fetch_latest_news_from_finhub

from flask_restx import Namespace, Resource

api_ns = Namespace('insights', description='Market insights and news')

@api_ns.route('/news/finhub/')
class NewsResouruce(Resource):
    def get(self):
        """Fetches and returns the latest market news."""
        try:
            news = fetch_latest_news_from_finhub()
            return {"news": news}, 200
        except Exception as e:
            return {"error": str(e)}, 500

@api_ns.route('/news/alphavantage/')
class NewsResouruce(Resource):
    def get(self):
        """Fetches and returns the latest market news."""
        try:
            news = fetch_latest_news_from_alphavantage()
            return {"news": news}, 200
        except Exception as e:
            return {"error": str(e)}, 500