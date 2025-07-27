import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/contexts/finance-context';
import { useCurrency } from '@/contexts/currency-context';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

export default function Reports() {
  const { transactions } = useFinance();
  const { formatAmount } = useCurrency();
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter transactions based on date range
  const getFilteredTransactions = () => {
    const now = new Date();
    let filterDate = new Date();

    if (dateRange === 'custom') {
      if (!startDate || !endDate) return transactions;
      return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
      });
    }

    switch (dateRange) {
      case '7':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90':
        filterDate.setDate(now.getDate() - 90);
        break;
      case '365':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(t => new Date(t.date) >= filterDate);
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate summary data
  const summary = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpenses += transaction.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpenses: 0 }
  );

  const netIncome = summary.totalIncome - summary.totalExpenses;
  const savingsRate = summary.totalIncome > 0 ? (netIncome / summary.totalIncome) * 100 : 0;

  // Category breakdown
  const categoryData = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0;
      }
      acc[transaction.category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Monthly trend data
  const monthlyData = filteredTransactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expenses += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const trendData = Object.values(monthlyData).sort((a: any, b: any) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  // Top categories by spending
  const topCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Title', 'Category', 'Type', 'Amount', 'Notes'],
      ...filteredTransactions.map(t => [
        t.date,
        t.title,
        t.category,
        t.type,
        t.amount.toString(),
        t.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV report exported successfully');
  };

  const handleExportPDF = () => {
    // In a real app, you would use a library like jsPDF
    toast.info('PDF export feature coming soon');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Reports & Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Detailed insights into your financial patterns
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-950 font-medium" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-950 font-medium" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatAmount(summary.totalIncome)}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              {filteredTransactions.filter(t => t.type === 'income').length} transactions
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatAmount(summary.totalExpenses)}
            </div>
            <div className="flex items-center text-xs text-red-600 dark:text-red-400 mt-2">
              <TrendingDown className="h-3 w-3 mr-1" />
              {filteredTransactions.filter(t => t.type === 'expense').length} transactions
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'}`}>
              {formatAmount(Math.abs(netIncome))}
            </div>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              {netIncome >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {netIncome >= 0 ? 'Surplus' : 'Deficit'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {savingsRate.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-2">
              <BarChart3 className="h-3 w-3 mr-1" />
              {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Needs improvement'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income vs Expenses Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Income vs Expenses Trend</CardTitle>
            <CardDescription>
              Monthly comparison over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Income" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    name="Expenses" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Distribution of expenses across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {pieChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
          <CardDescription>
            Your highest expense categories in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No expense data available for the selected period
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCategories.map(([category, amount], index) => {
                const percentage = (amount / summary.totalExpenses) * 100;
                return (
                  <div key={category} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                          {category}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {percentage.toFixed(1)}% of total expenses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {formatAmount(amount)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {filteredTransactions.filter(t => t.category === category && t.type === 'expense').length} transactions
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}