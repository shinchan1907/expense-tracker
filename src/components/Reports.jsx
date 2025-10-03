import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getExpenses, isSessionExpired } from '../utils/api';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#FF2D92', '#5AC8FA', '#FFCC00'];

export default function Reports({ sessionToken, onBack, onSessionExpired }) {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    category: 'all'
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filters]);

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses(sessionToken);
      
      if (!response.success) {
        if (isSessionExpired(response.error)) {
          onSessionExpired();
          return;
        }
        throw new Error(response.error);
      }

      const expensesData = response.expenses || [];
      setExpenses(expensesData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(expensesData.map(e => e.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = expenses;

    // Date range filter
    if (filters.startDate && filters.endDate) {
      const start = parseISO(filters.startDate);
      const end = parseISO(filters.endDate);
      filtered = filtered.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return isWithinInterval(expenseDate, { start, end });
      });
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    setFilteredExpenses(filtered);
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      const category = expense.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    expenses.forEach(expense => {
      const month = format(parseISO(expense.date), 'MMM yyyy');
      monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(expense.amount);
    });

    return Object.entries(monthlyTotals)
      .map(([month, amount]) => ({
        month,
        amount: parseFloat(amount.toFixed(2))
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const getDailyData = () => {
    const dailyTotals = {};
    filteredExpenses.forEach(expense => {
      const day = format(parseISO(expense.date), 'MMM dd');
      dailyTotals[day] = (dailyTotals[day] || 0) + parseFloat(expense.amount);
    });

    return Object.entries(dailyTotals)
      .map(([day, amount]) => ({
        day,
        amount: parseFloat(amount.toFixed(2))
      }))
      .sort((a, b) => new Date(a.day) - new Date(b.day));
  };

  const getAIGroupedData = () => {
    const groups = {
      'Essentials': 0,
      'Utilities': 0,
      'Discretionary': 0
    };

    filteredExpenses.forEach(expense => {
      const category = expense.category.toLowerCase();
      const description = expense.description.toLowerCase();
      const aiSummary = (expense.aiSummary || '').toLowerCase();

      // Simple AI-based categorization logic
      if (category.includes('food') || category.includes('healthcare') || 
          description.includes('grocery') || description.includes('medicine')) {
        groups['Essentials'] += parseFloat(expense.amount);
      } else if (category.includes('bills') || category.includes('utilities') || 
                 description.includes('rent') || description.includes('electric')) {
        groups['Utilities'] += parseFloat(expense.amount);
      } else {
        groups['Discretionary'] += parseFloat(expense.amount);
      }
    });

    return Object.entries(groups).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const getInsights = () => {
    const insights = [];
    const total = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const categoryData = getCategoryData();
    
    if (categoryData.length > 0) {
      const topCategory = categoryData.reduce((max, cat) => cat.value > max.value ? cat : max);
      insights.push(`Your highest spending category is ${topCategory.name} at ${formatCurrency(topCategory.value)}`);
    }

    const avgDaily = total / Math.max(1, filteredExpenses.length);
    insights.push(`Average expense amount: ${formatCurrency(avgDaily)}`);

    if (total > 50000) {
      insights.push('💡 Consider setting up a monthly budget to track your spending goals');
    }

    return insights;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <button onClick={onBack} className="text-ios-blue font-medium mr-4">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-ios-gray-900">Reports</h1>
          </div>
          <div className="text-center text-ios-gray-500">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="text-ios-blue font-medium mr-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ios-gray-900">Reports</h1>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-ios-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-ios-gray-900">
              {formatCurrency(filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0))}
            </div>
            <div className="text-sm text-ios-gray-500">Total Spent</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-ios-gray-900">
              {filteredExpenses.length}
            </div>
            <div className="text-sm text-ios-gray-500">Transactions</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-ios-gray-900">
              {formatCurrency(filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) / Math.max(1, filteredExpenses.length))}
            </div>
            <div className="text-sm text-ios-gray-500">Avg Amount</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-ios-gray-900">
              {categories.length}
            </div>
            <div className="text-sm text-ios-gray-500">Categories</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Pie Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-ios-gray-900 mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Bar Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-ios-gray-900 mb-4">Monthly Spending Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#007AFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Line Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-ios-gray-900 mb-4">Daily Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getDailyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" stroke="#34C759" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI-Grouped Stacked Bar */}
          <div className="card">
            <h3 className="text-lg font-semibold text-ios-gray-900 mb-4">Spending Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getAIGroupedData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#FF9500" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-ios-gray-900 mb-4">💡 Insights & Tips</h3>
          <div className="space-y-3">
            {getInsights().map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-ios-gray-50 rounded-ios"
              >
                <p className="text-ios-gray-700">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}