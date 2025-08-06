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
            if len(news) == 5:
                break

    return news

def fetch_latest_news_from_alphavantage():
    __AV_KEY = 'KDGX83CIL4Q8EKZZ'
    __AV_URL = f'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=earnings&apikey={__AV_KEY}'

    response = requests.get(__AV_URL).json()
    news = []

    if 'feed' in response:
        for article in response['feed'][:5]:
            news.append({
                "headline": article.get("title"),
                "source": article.get("source"),
                "url": article.get("url"),
            })
    
    return news

