// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Portfolio related types
export interface Portfolio {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePortfolioRequest {
  user_id: number;
  name: string;
  description?: string;
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
}

// Asset related types
export interface Asset {
  id: number;
  symbol: string;
  name: string;
  asset_type?: string;
  exchange?: string;
  sector?: string;
  current_price?: number;
}

// Holding related types
export interface Holding {
  id: number;
  portfolio_id: number;
  asset_id: number;
  quantity: number;
  purchase_price: number;
}

// Transaction related types
export interface Transaction {
  id: number;
  portfolio_id: number;
  asset_id: number;
  quantity: number;
  price: number;
  created_at: string;
  transaction_type?: string;
  fee?: number;
  tax?: number;
  currency?: string;
}

// User related types
export interface User {
  id: number;
  name: string;
  email: string;
}

// API Error type
export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}
