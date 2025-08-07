import requests


def fetch_latest_news_from_finhub():
    __FH_KEY = 'd296ut9r01qhoenaa7jgd296ut9r01qhoenaa7k0'
    __FH_URL = f'https://finnhub.io/api/v1/news?category=general&token={__FH_KEY}'

    response = requests.get(__FH_URL).json()
    news = []

    if isinstance(response, list):
        for r in response:
            if r.get('category') == 'business':
                news.append({
                    "headline": r.get("headline"),
                    "source": r.get("source"),
                    "url": r.get("url"),
                })
            if len(news) == 4:
                break

    return news

def fetch_latest_news_from_alphavantage():
    __AV_KEY = 'KDGX83CIL4Q8EKZZ'
    __AV_URL = f'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=earnings&apikey={__AV_KEY}'

    response = requests.get(__AV_URL).json()
    news = []

    if 'feed' in response:
        for article in response['feed'][:4]:
            news.append({
                "headline": article.get("title"),
                "source": article.get("source"),
                "url": article.get("url"),
            })
    
    return news

def fetch_latest_news_combined():
    """
    Try Alpha Vantage first, fallback to Finnhub if Alpha Vantage returns empty array
    """
    try:
        # Try Alpha Vantage first
        av_news = fetch_latest_news_from_alphavantage()
        
        # If Alpha Vantage returns empty array, try Finnhub
        if not av_news:
            print("Alpha Vantage returned empty array, trying Finnhub...")
            return fetch_latest_news_from_finhub()
        
        return av_news
    except Exception as e:
        print(f"Error with Alpha Vantage, trying Finnhub: {e}")
        # If Alpha Vantage fails, try Finnhub
        return fetch_latest_news_from_finhub()

