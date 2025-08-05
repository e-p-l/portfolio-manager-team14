//index.ts file in client/src/types folder
// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Portfolio related types
export interface Portfolio {
  id: number;
  name: string;
  balance: number;  
  user_id: number;
  created_at: string;
  updated_at: string;
  description?: string; 
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
  id?: number; // Optional - only needed for database operations
  symbol: string;
  name: string;
  asset_type?: string;
  exchange?: string;
  sector?: string;
  current_price?: number;
  day_changeP?: number; // Add this for price change percentage
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

// Watchlist related types
export interface WatchlistItem {
  id: number;
  portfolio_id: number;
  asset_id: number;
  added_date: string;
  notes?: string;
  asset_symbol?: string;
  asset_name?: string;
  asset_type?: string;
  asset_sector?: string;
  day_changeP?: number;
  current_price?: number;
  day_change?: number;
}

export interface CreateWatchlistRequest {
  asset_id: number;
  notes?: string;
}

export interface UpdateWatchlistRequest {
  notes?: string;
}
