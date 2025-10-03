import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { addExpense, isSessionExpired } from '../utils/api';

export default function ExpenseForm({ sessionToken, onBack, onExpenseAdded, onSessionExpired }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Submitting expense:', formData);

    try {
      const response = await addExpense(sessionToken, formData);
      console.log('Expense submission response:', response);
      
      if (!response.success) {
        if (isSessionExpired(response.error)) {
          onSessionExpired();
          return;
        }
        throw new Error(response.error || 'Failed to add expense');
      }

      console.log('Expense added successfully:', response.expense);
      onExpenseAdded();
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err.message || 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
          <h1 className="text-2xl font-bold text-ios-gray-900">Add Expense</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="What did you spend on?"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* AI Category Notice */}
            <div className="bg-ios-blue/10 p-3 rounded-ios">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <div>
                  <div className="text-sm font-medium text-ios-blue">AI-Powered Categorization</div>
                  <div className="text-xs text-ios-gray-600">
                    Our AI will automatically categorize and summarize your expense
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-ios-red text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.95 }}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}