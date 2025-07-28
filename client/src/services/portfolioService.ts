import { apiClient } from './apiClient';
import { Portfolio, CreatePortfolioRequest, UpdatePortfolioRequest } from '../types';

export class PortfolioService {
  // Get all portfolios
  static async getAllPortfolios(): Promise<Portfolio[]> {
    return apiClient.get<Portfolio[]>('/portfolios');
  }

  // Get a single portfolio by ID
  static async getPortfolio(id: number): Promise<Portfolio> {
    return apiClient.get<Portfolio>(`/portfolios/${id}`);
  }

  // Create a new portfolio
  static async createPortfolio(data: CreatePortfolioRequest): Promise<Portfolio> {
    return apiClient.post<Portfolio>('/portfolios', data);
  }

  // Update an existing portfolio
  static async updatePortfolio(id: number, data: UpdatePortfolioRequest): Promise<Portfolio> {
    return apiClient.put<Portfolio>(`/portfolios/${id}`, data);
  }

  // Delete a portfolio
  static async deletePortfolio(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/portfolios/${id}`);
  }
}

export default PortfolioService;
