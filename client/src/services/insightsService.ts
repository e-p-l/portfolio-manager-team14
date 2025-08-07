import { apiClient } from './apiClient';

export interface MarketInsight {
  headline: string;
  source: string;
  url: string;
}

export interface MarketInsightsResponse {
  news: MarketInsight[];
}

export class InsightsService {
  // Get market insights from Alpha Vantage
  static async getMarketInsights(): Promise<MarketInsight[]> {
    const response = await apiClient.get<MarketInsightsResponse>('/insights/news/alphavantage/');
    return response.news;
  }

  // Get market insights from Finnhub (alternative source)
  static async getMarketInsightsFromFinnhub(): Promise<MarketInsight[]> {
    const response = await apiClient.get<MarketInsightsResponse>('/insights/news/finhub/');
    return response.news;
  }

  // Get market insights with fallback logic (Alpha Vantage -> Finnhub)
  static async getMarketInsightsCombined(): Promise<MarketInsight[]> {
    const response = await apiClient.get<MarketInsightsResponse>('/insights/news/combined/');
    return response.news;
  }
}

export default InsightsService;
