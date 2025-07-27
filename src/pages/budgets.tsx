import React, { useState } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinance, categories } from '@/contexts/finance-context';
import { useCurrency } from '@/contexts/currency-context';
import { toast } from 'sonner';

export default function Budgets() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useFinance();
  const { formatAmount } = useCurrency();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'weekly' | 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.limit) {
      toast.error('Please fill in all required fields');
      return;
    }

    const budgetData = {
      ...formData,
      limit: parseFloat(formData.limit)
    };

    if (editingBudget) {
      updateBudget(editingBudget.id, budgetData);
      toast.success('Budget updated successfully');
      setEditingBudget(null);
    } else {
      addBudget(budgetData);
      toast.success('Budget created successfully');
    }

    setFormData({
      category: '',
      limit: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period,
      startDate: budget.startDate
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBudget(id);
    toast.success('Budget deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      category: '',
      limit: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0]
    });
    setEditingBudget(null);
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'red', icon: AlertTriangle };
    if (percentage >= 80) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'good', color: 'green', icon: CheckCircle };
  };

  const availableCategories = categories.filter(
    category => !budgets.some(budget => budget.category === category) || 
    (editingBudget && editingBudget.category === category)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Budgets
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Set and track your spending limits
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </DialogTitle>
              <DialogDescription>
                {editingBudget ? 'Update budget details' : 'Set a spending limit for a category'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={!!editingBudget}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Budget Limit *</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period">Period *</Label>
                  <Select value={formData.period} onValueChange={(value: 'weekly' | 'monthly') => 
                    setFormData({ ...formData, period: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold shadow-lg">
                  {editingBudget ? 'Update' : 'Create'} Budget
                </Button>
                <Button type="button" variant="outline" className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-800 font-medium" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {budgets.length}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Active budget categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Total Budget Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatAmount(budgets.reduce((sum, budget) => sum + budget.limit, 0))}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Combined spending limit
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatAmount(budgets.reduce((sum, budget) => sum + budget.spent, 0))}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Across all budgets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No budgets created yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Create your first budget to start tracking your spending limits
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const { status, color, icon: StatusIcon } = getBudgetStatus(budget.spent, budget.limit);
            const remaining = budget.limit - budget.spent;

            return (
              <Card key={budget.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-950"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-600 dark:hover:bg-red-950"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600 hover:text-red-700" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {budget.period}
                    </Badge>
                    <Badge 
                      variant={status === 'exceeded' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Spent</span>
                      <span className="font-medium">{formatAmount(budget.spent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Budget</span>
                      <span className="font-medium">{formatAmount(budget.limit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Remaining</span>
                      <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(Math.abs(remaining))}
                        {remaining < 0 && ' over'}
                      </span>
                    </div>
                  </div>

                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-3 ${
                      status === 'exceeded'
                        ? '[&>div]:bg-red-500'
                        : status === 'warning'
                        ? '[&>div]:bg-yellow-500'
                        : '[&>div]:bg-green-500'
                    }`}
                  />

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Started {new Date(budget.startDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}