import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import Reports from '../components/Reports';
import { getSessionToken, removeSessionToken } from '../utils/api';

export default function Home() {
  const [currentView, setCurrentView] = useState('login');
  const [sessionToken, setSessionTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    try {
      const token = getSessionToken();
      console.log('Existing token:', token);
      if (token) {
        setSessionTokenState(token);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    try {
      const token = getSessionToken();
      console.log('Login success, token:', token);
      setSessionTokenState(token);
      setCurrentView('dashboard');
      console.log('Navigating to dashboard');
    } catch (error) {
      console.error('Error in handleLoginSuccess:', error);
    }
  };

  const handleLogout = () => {
    removeSessionToken();
    setSessionTokenState(null);
    setCurrentView('login');
  };

  const handleSessionExpired = () => {
    removeSessionToken();
    setSessionTokenState(null);
    setCurrentView('login');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleExpenseAdded = () => {
    console.log('Expense added, returning to dashboard');
    setCurrentView('dashboard');
    // Force dashboard to refresh by updating a key
    setSessionTokenState(prev => prev); // Trigger re-render
  };

  const renderCurrentView = () => {
    console.log('Rendering view:', currentView, 'with token:', sessionToken);
    
    try {
      switch (currentView) {
        case 'login':
          return <LoginForm onLoginSuccess={handleLoginSuccess} />;
        
        case 'dashboard':
          if (!sessionToken) {
            console.log('No session token, redirecting to login');
            setCurrentView('login');
            return <LoginForm onLoginSuccess={handleLoginSuccess} />;
          }
          return (
            <Dashboard
              sessionToken={sessionToken}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          );
        
        case 'add-expense':
          return (
            <ExpenseForm
              sessionToken={sessionToken}
              onBack={() => handleNavigate('dashboard')}
              onExpenseAdded={handleExpenseAdded}
              onSessionExpired={handleSessionExpired}
            />
          );
        
        case 'expenses':
          return (
            <ExpenseList
              sessionToken={sessionToken}
              onBack={() => handleNavigate('dashboard')}
              onSessionExpired={handleSessionExpired}
            />
          );
        
        case 'reports':
          return (
            <Reports
              sessionToken={sessionToken}
              onBack={() => handleNavigate('dashboard')}
              onSessionExpired={handleSessionExpired}
            />
          );
        
        default:
          console.log('Unknown view, showing login');
          return <LoginForm onLoginSuccess={handleLoginSuccess} />;
      }
    } catch (error) {
      console.error('Error rendering view:', error);
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">Something went wrong. Please try again.</p>
            <button 
              onClick={() => {
                setCurrentView('login');
                setSessionTokenState(null);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }
  };

  // Show loading state initially
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ios-gray-50 flex items-center justify-center">
        <div className="text-ios-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-gray-50">
      <div className="w-full">
        {renderCurrentView()}
      </div>
    </div>
  );
}