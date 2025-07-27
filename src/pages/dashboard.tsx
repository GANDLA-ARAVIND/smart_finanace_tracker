import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useFinance } from '@/contexts/finance-context';
import { useCurrency } from '@/contexts/currency-context';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

export default function Dashboard() {
  const { transactions, budgets, getMonthlyData } = useFinance();
  const { formatAmount } = useCurrency();
  
  const monthlyData = getMonthlyData();
  
  // Spending by category data for pie chart
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Monthly trend data for bar chart
  const monthlyTrend = [
    { month: 'Oct', income: 65000, expenses: 45000 },
    { month: 'Nov', income: 72000, expenses: 52000 },
    { month: 'Dec', income: 68000, expenses: 48000 },
    { month: 'Jan', income: monthlyData.income, expenses: monthlyData.expenses },
  ];

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Overview of your financial health
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Income
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatAmount(monthlyData.income)}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatAmount(monthlyData.expenses)}
            </div>
            <div className="flex items-center text-xs text-red-600 dark:text-red-400 mt-2">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Current Balance
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatAmount(monthlyData.balance)}
            </div>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Healthy savings rate
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Active Budgets
            </CardTitle>
            <PiggyBank className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {budgets.length}
            </div>
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-2">
              <CreditCard className="h-3 w-3 mr-1" />
              {budgets.filter(b => b.spent / b.limit > 0.8).length} near limit
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Distribution of your expenses this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                </PieChart>
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

        {/* Income vs Expenses Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>
              Monthly comparison over the last 4 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress and Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget Progress */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>
              Track your spending against budget limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = percentage > 100;
              const isNearLimit = percentage > 80;
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{budget.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatAmount(budget.spent)} / {formatAmount(budget.limit)}
                      </span>
                      <Badge
                        variant={isOverBudget ? 'destructive' : isNearLimit ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${
                      isOverBudget
                        ? 'bg-red-100 dark:bg-red-900'
                        : isNearLimit
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : 'bg-green-100 dark:bg-green-900'
                    }`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-red-100 dark:bg-red-900'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatAmount(transaction.amount)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}