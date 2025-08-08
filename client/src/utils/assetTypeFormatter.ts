/**
 * Utility functions for formatting asset types from backend to frontend
 */

// Mapping from backend asset types to user-friendly frontend labels
export const ASSET_TYPE_LABELS: { [key: string]: string } = {
  // Core asset types from yfinance
  'EQUITY': 'Equity',
  'ETF': 'ETF',
  'MUTUALFUND': 'Mutual Fund',
  'CURRENCY': 'Currency',
  'CRYPTOCURRENCY': 'Cryptocurrency',
  'INDEX': 'Index',
  'BOND': 'Bond',
  'COMMODITY': 'Commodity',
  'OPTION': 'Option',
  'REIT': 'Real Estate',
  'FUTURE': 'Future',
  'OTHER': 'Other',
  
  // Lowercase versions (for backward compatibility)
  'equity': 'Equity',
  'etf': 'ETF',
  'mutualfund': 'Mutual Fund',
  'stock': 'Stock',
  'currency': 'Currency',
  'cryptocurrency': 'Cryptocurrency',
  'index': 'Index',
  'bond': 'Bond',
  'commodity': 'Commodity',
  'option': 'Option',
  'future': 'Future',
  'cash': 'Cash',
  'other': 'Other',
  
  // Fallback
  'unknown': 'Unknown',
  'n/a': 'N/A'
};

/**
 * Formats an asset type from backend format to user-friendly frontend format
 * @param assetType - The asset type from the backend (e.g., 'EQUITY', 'MUTUALFUND')
 * @returns User-friendly formatted asset type (e.g., 'Equity', 'Mutual Fund')
 */
export const formatAssetType = (assetType?: string | null): string => {
  if (!assetType) {
    return 'Unknown';
  }
  
  return ASSET_TYPE_LABELS[assetType] || ASSET_TYPE_LABELS[assetType.toLowerCase()] || assetType;
};

/**
 * Gets the original backend asset type from a formatted frontend label
 * @param formattedType - The formatted asset type (e.g., 'Mutual Fund')
 * @returns The backend asset type (e.g., 'MUTUALFUND') or the input if not found
 */
export const getBackendAssetType = (formattedType: string): string => {
  const entry = Object.entries(ASSET_TYPE_LABELS).find(([_, value]) => value === formattedType);
  return entry ? entry[0] : formattedType;
};

/**
 * Gets all available asset type options for dropdowns/selects
 * @returns Array of formatted asset type labels
 */
export const getAssetTypeOptions = (): string[] => {
  // Return unique formatted values, excluding duplicates and fallbacks
  const uniqueTypes = new Set(Object.values(ASSET_TYPE_LABELS));
  return Array.from(uniqueTypes).filter(type => !['Unknown', 'N/A'].includes(type)).sort();
};
