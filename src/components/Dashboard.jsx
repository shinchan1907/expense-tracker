import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getExpenses, isSessionExpired, removeSessionToken } from '../utils/api';

export default function Dashboard({ sessionToken, onLogout, onNavigate }) {
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard mounted, fetching data...');
    fetchMonthlyTotal();
  }, [sessionToken]); // Refresh when sessionToken changes

  const fetchMonthlyTotal = async () => {
    try {
      const response = await getExpenses(sessionToken);
      
      if (!response.success) {
        if (isSessionExpired(response.error)) {
          handleLogout();
          return;
        }
        throw new Error(response.error);
      }

      // Calculate current month total
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTotal = (response.expenses || [])
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

      setTotalSpent(monthlyTotal);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Set a default value instead of showing error
      setTotalSpent(0);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeSessionToken();
    onLogout();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-ios-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-ios-blue font-medium"
          >
            Logout
          </button>
        </div>

        {/* Monthly Total Card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="card mb-6"
        >
          <div className="text-center">
            <p className="text-ios-gray-500 mb-2">Total Spent in {getCurrentMonth()}</p>
            {loading ? (
              <div className="text-3xl font-bold text-ios-gray-400">Loading...</div>
            ) : (
              <div className="text-3xl font-bold text-ios-gray-900">
                {formatCurrency(totalSpent)}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('add-expense')}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <span className="text-xl">+</span>
            <span>Add Expense</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('expenses')}
            className="w-full btn-secondary"
          >
            View All Expenses
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('reports')}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <span>📊</span>
            <span>Reports & Analytics</span>
          </motion.button>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="text-lg font-semibold text-ios-gray-900">This Week</div>
            <div className="text-sm text-ios-gray-500">Coming soon</div>
          </div>
          <div className="card text-center">
            <div className="text-lg font-semibold text-ios-gray-900">Categories</div>
            <div className="text-sm text-ios-gray-500">Coming soon</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}