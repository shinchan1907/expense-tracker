import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getExpenses, isSessionExpired } from '../utils/api';

export default function ExpenseList({ sessionToken, onBack, onSessionExpired }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

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

      // Sort expenses by date (newest first)
      const sortedExpenses = (response.expenses || []).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setExpenses(sortedExpenses);
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills & Utilities': '💡',
      'Healthcare': '🏥',
      'Other': '📝'
    };
    return icons[category] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <button onClick={onBack} className="text-ios-blue font-medium mr-4">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-ios-gray-900">Expenses</h1>
          </div>
          <div className="text-center text-ios-gray-500">Loading expenses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="text-ios-blue font-medium mr-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ios-gray-900">Expenses</h1>
        </div>

        {error && (
          <div className="card mb-4">
            <div className="text-ios-red text-center">{error}</div>
          </div>
        )}

        {expenses.length === 0 ? (
          <div className="card text-center">
            <div className="text-ios-gray-500 mb-4">No expenses yet</div>
            <p className="text-sm text-ios-gray-400">
              Start tracking your expenses by adding your first one!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <div className="font-semibold text-ios-gray-900">
                        {expense.description}
                      </div>
                      <div className="text-sm text-ios-gray-500">
                        {expense.category} • {formatDate(expense.date)}
                      </div>
                      {expense.aiSummary && (
                        <div className="text-xs text-ios-gray-400 mt-1">
                          {expense.aiSummary}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-ios-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary */}
        {expenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card mt-6"
          >
            <div className="text-center">
              <div className="text-sm text-ios-gray-500 mb-1">Total</div>
              <div className="text-xl font-bold text-ios-gray-900">
                {formatCurrency(
                  expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}