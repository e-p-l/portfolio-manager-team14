import { apiClient } from './apiClient';
import { Asset } from '../types';

export interface Transaction {
  id: number;
  portfolio_id: number;
  holding_id: number;
  quantity: number;
  price: number;
  created_at: string;
  transaction_type: 'buy' | 'sell';
  asset_symbol?: string; // Added asset symbol
}

export interface CreateTransactionRequest {
  portfolio_id: number;
  asset_id: number;  // Required for both buy and sell (backend bug, but we need to match)
  holding_id?: number;  // Required for sell transactions
  quantity: number;
  transaction_type: 'buy' | 'sell';
}

export const TransactionService = {
  // Create a new transaction (buy or sell)
  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    return await apiClient.post<Transaction>('/transactions/', transaction);
  },

  // Buy an asset - creates a BUY transaction
  async buyAsset(portfolioId: number, asset: Asset, quantity: number): Promise<Transaction> {
    // Ensure the asset has an ID
    if (!asset.id) {
      throw new Error('Asset must have an ID to create a transaction. Please ensure the asset is properly saved.');
    }
    
    return this.createTransaction({
      portfolio_id: portfolioId,
      asset_id: asset.id,
      quantity: quantity,
      transaction_type: 'buy'
    });
  },

  // Sell a holding - creates a SELL transaction
  async sellHolding(portfolioId: number, holdingId: number, assetId: number, quantity: number): Promise<Transaction> {
    return this.createTransaction({
      portfolio_id: portfolioId,
      asset_id: assetId,  // Backend requires asset_id even for sells
      holding_id: holdingId,
      quantity: quantity,
      transaction_type: 'sell'
    });
  },

  // Get all transactions
  async getTransactions(): Promise<Transaction[]> {
    return await apiClient.get<Transaction[]>('/transactions/');
  },

  // Get transactions by portfolio
  async getTransactionsByPortfolio(portfolioId: number): Promise<Transaction[]> {
    return await apiClient.get<Transaction[]>(`/portfolios/${portfolioId}/transactions`);
  },

  // Get a specific transaction
  async getTransaction(id: number): Promise<Transaction> {
    return await apiClient.get<Transaction>(`/transactions/${id}`);
  },
};
