import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth-context';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  notes?: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'weekly' | 'monthly';
  startDate: string;
  spent: number;
}

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[];
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, data: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (data: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  updateBudget: (id: string, data: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getMonthlyData: () => { income: number; expenses: number; balance: number };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const categories = [
  'Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Salary', 'Freelance', 'Other'
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [transactionsRes, budgetsRes] = await Promise.all([
        axios.get(`${API_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/budgets`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setTransactions(transactionsRes.data);
      setBudgets(budgetsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id'>) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/transactions`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTransactions([...transactions, response.data]);
  };

  const updateTransaction = async (id: string, data: Omit<Transaction, 'id'>) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/transactions/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTransactions(transactions.map(t => (t.id === id ? response.data : t)));
  };

  const deleteTransaction = async (id: string) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addBudget = async (data: Omit<Budget, 'id' | 'spent'>) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/budgets`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBudgets([...budgets, response.data]);
  };

  const updateBudget = async (id: string, data: Omit<Budget, 'id' | 'spent'>) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/budgets/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBudgets(budgets.map(b => (b.id === id ? response.data : b)));
  };

  const deleteBudget = async (id: string) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/budgets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const getMonthlyData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses };
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        getMonthlyData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};