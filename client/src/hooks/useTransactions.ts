import { useState, useEffect } from 'react';
import { TransactionService, Transaction } from '../services/transactionService';

export const useTransactions = (portfolioId: number) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!portfolioId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await TransactionService.getTransactionsByPortfolio(portfolioId);
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to fetch transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [portfolioId]);

  return { transactions, loading, error };
};
