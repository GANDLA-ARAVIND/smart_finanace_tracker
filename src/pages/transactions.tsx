import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFinance, categories } from '@/contexts/finance-context';
import { useCurrency } from '@/contexts/currency-context';
import { toast } from 'sonner';

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { formatAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
      toast.success('Transaction updated successfully');
      setEditingTransaction(null);
    } else {
      addTransaction(transactionData);
      toast.success('Transaction added successfully');
    }

    setFormData({
      title: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      notes: transaction.notes || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success('Transaction deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your income and expenses
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction ? 'Update transaction details' : 'Enter the details for your new transaction'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Transaction title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => 
                    setFormData({ ...formData, type: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => 
                    setFormData({ ...formData, category: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold shadow-lg">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </Button>
                <Button type="button" variant="outline" className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-800 font-medium" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No transactions found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm || filterCategory !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first transaction to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-red-100 dark:bg-red-900'
                      }`}
                    >
                      <DollarSign
                        className={`h-6 w-6 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {transaction.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-950"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-2 border-red-200 hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-600 dark:hover:bg-red-950"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}