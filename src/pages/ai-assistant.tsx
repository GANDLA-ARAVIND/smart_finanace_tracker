import React, { useState } from 'react';
import { Send, Bot, User, Lightbulb, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFinance } from '@/contexts/finance-context';
import { useCurrency } from '@/contexts/currency-context';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  type: 'tip' | 'alert' | 'goal';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export default function AIAssistant() {
  const { transactions, budgets, getMonthlyData } = useFinance();
  const { formatAmount } = useCurrency();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI financial assistant. I can help you analyze your spending patterns, suggest budget optimizations, and provide personalized financial advice. What would you like to know about your finances?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const monthlyData = getMonthlyData();

  // Generate AI suggestions based on user data
  const generateSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    // Budget alerts
    budgets.forEach(budget => {
      const percentage = (budget.spent / budget.limit) * 100;
      if (percentage > 90) {
        suggestions.push({
          id: `budget-${budget.id}`,
          type: 'alert',
          title: `${budget.category} Budget Alert`,
          description: `You've spent ${percentage.toFixed(0)}% of your ${budget.category} budget. Consider reducing spending in this category.`,
          priority: 'high'
        });
      } else if (percentage > 75) {
        suggestions.push({
          id: `budget-warning-${budget.id}`,
          type: 'alert',
          title: `${budget.category} Budget Warning`,
          description: `You're approaching your ${budget.category} budget limit (${percentage.toFixed(0)}% used).`,
          priority: 'medium'
        });
      }
    });

    // Savings suggestions
    const savingsRate = monthlyData.income > 0 ? (monthlyData.balance / monthlyData.income) * 100 : 0;
    if (savingsRate < 20) {
      suggestions.push({
        id: 'savings-tip',
        type: 'tip',
        title: 'Improve Your Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income for a healthy financial future.`,
        priority: 'medium'
      });
    }

    // Spending pattern insights
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)[0];

    if (topCategory && topCategory[1] > monthlyData.income * 0.3) {
      suggestions.push({
        id: 'spending-pattern',
        type: 'tip',
        title: 'High Spending Category Detected',
        description: `${topCategory[0]} accounts for a large portion of your expenses (${formatAmount(topCategory[1])}). Consider reviewing this category for potential savings.`,
        priority: 'medium'
      });
    }

    // Goal suggestions
    if (monthlyData.balance > 0) {
      suggestions.push({
        id: 'investment-goal',
        type: 'goal',
        title: 'Consider Investment Opportunities',
        description: `With a positive balance of ${formatAmount(monthlyData.balance)}, you might want to explore investment options to grow your wealth.`,
        priority: 'low'
      });
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('budget') || input.includes('spending')) {
      const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
      return `Based on your current budgets, you have allocated ${formatAmount(totalBudget)} across ${budgets.length} categories. You've spent ${formatAmount(totalSpent)} so far, which is ${((totalSpent / totalBudget) * 100).toFixed(1)}% of your total budget. ${totalSpent / totalBudget > 0.8 ? 'You might want to be more careful with your spending.' : 'You\'re doing well staying within your budgets!'}`;
    }
    
    if (input.includes('save') || input.includes('saving')) {
      const savingsRate = monthlyData.income > 0 ? (monthlyData.balance / monthlyData.income) * 100 : 0;
      return `Your current savings rate is ${savingsRate.toFixed(1)}%. ${savingsRate >= 20 ? 'Excellent! You\'re saving a healthy amount.' : savingsRate >= 10 ? 'Good start! Try to increase your savings rate to 20% if possible.' : 'Consider reducing expenses or increasing income to improve your savings rate. Aim for at least 10-20% of your income.'}`;
    }
    
    if (input.includes('income') || input.includes('earn')) {
      return `Your current monthly income is ${formatAmount(monthlyData.income)}. ${monthlyData.income > monthlyData.expenses ? 'You\'re earning more than you spend, which is great!' : 'Consider ways to increase your income or reduce expenses to improve your financial health.'}`;
    }
    
    if (input.includes('expense') || input.includes('spend')) {
      return `Your monthly expenses total ${formatAmount(monthlyData.expenses)}. Your biggest expense categories might benefit from review. Consider tracking your daily expenses more closely to identify areas for potential savings.`;
    }
    
    if (input.includes('goal') || input.includes('plan')) {
      return `Setting financial goals is crucial for success! Based on your current financial situation, consider setting goals for: 1) Building an emergency fund (3-6 months of expenses), 2) Increasing your savings rate, 3) Paying off any high-interest debt, and 4) Long-term investment planning.`;
    }
    
    // Default response
    return `I understand you're asking about "${userInput}". Based on your financial data, I can help you with budgeting, spending analysis, savings strategies, and financial goal setting. Your current financial health shows ${monthlyData.balance >= 0 ? 'positive' : 'negative'} cash flow. Would you like specific advice on any particular area?`;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'tip': return Lightbulb;
      case 'alert': return AlertTriangle;
      case 'goal': return Target;
      default: return TrendingUp;
    }
  };

  const getSuggestionColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          AI Financial Assistant
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Get personalized insights and recommendations for your finances
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                AI Assistant Chat
              </CardTitle>
              <CardDescription>
                Ask questions about your finances and get personalized advice
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' 
                            ? 'text-blue-100' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about your finances..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Smart Suggestions
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your financial data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.length === 0 ? (
                <div className="text-center py-6">
                  <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No suggestions at the moment. Keep tracking your finances for personalized insights!
                  </p>
                </div>
              ) : (
                suggestions.map((suggestion) => {
                  const Icon = getSuggestionIcon(suggestion.type);
                  return (
                    <div
                      key={suggestion.id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          suggestion.type === 'alert' 
                            ? 'bg-red-100 dark:bg-red-900' 
                            : suggestion.type === 'tip'
                            ? 'bg-yellow-100 dark:bg-yellow-900'
                            : 'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            suggestion.type === 'alert'
                              ? 'text-red-600'
                              : suggestion.type === 'tip'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{suggestion.title}</h4>
                            <Badge 
                              variant={getSuggestionColor(suggestion.priority) as any}
                              className="text-xs"
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
              <CardDescription>
                Common financial questions to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "How can I improve my savings rate?",
                "What's my biggest expense category?",
                "Am I staying within my budgets?",
                "How much should I save each month?",
                "What financial goals should I set?"
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3 text-sm border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-950 font-medium transition-all duration-200"
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0 disabled:opacity-50"
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}