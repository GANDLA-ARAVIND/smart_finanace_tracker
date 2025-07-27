import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

const currencies: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0095 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.8 },
];

interface CurrencyContextType {
  currentCurrency: Currency;
  currencies: Currency[];
  setCurrency: (currency: Currency) => void;
  convertAmount: (amount: number, fromCurrency?: Currency) => number;
  formatAmount: (amount: number, showSymbol?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies[0]);

  useEffect(() => {
    const stored = localStorage.getItem('finance-currency');
    if (stored) {
      const savedCurrency = currencies.find(c => c.code === stored);
      if (savedCurrency) {
        setCurrentCurrency(savedCurrency);
      }
    }
  }, []);

  const setCurrency = (currency: Currency) => {
    setCurrentCurrency(currency);
    localStorage.setItem('finance-currency', currency.code);
  };

  const convertAmount = (amount: number, fromCurrency: Currency = currencies[0]) => {
    // Convert from base currency (INR) to current currency
    const inINR = amount / fromCurrency.rate;
    return inINR * currentCurrency.rate;
  };

  const formatAmount = (amount: number, showSymbol: boolean = true) => {
    const converted = convertAmount(amount);
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Math.abs(converted));
    
    return `${showSymbol ? currentCurrency.symbol : ''}${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencies,
        setCurrency,
        convertAmount,
        formatAmount
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}