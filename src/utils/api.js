import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Use real Google Apps Script backend
const USE_MOCK_API = false; // Backend is ready and working

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for development
const mockExpenses = [
  {
    id: 1,
    date: '2025-10-01',
    amount: '250',
    description: 'Coffee and pastry',
    category: 'Food & Dining',
    aiSummary: 'Morning coffee expense at local cafe'
  },
  {
    id: 2,
    date: '2025-10-02',
    amount: '2500',
    description: 'Grocery shopping',
    category: 'Food & Dining',
    aiSummary: 'Weekly grocery shopping for essentials'
  },
  {
    id: 3,
    date: '2025-10-03',
    amount: '1200',
    description: 'Petrol',
    category: 'Transportation',
    aiSummary: 'Fuel for weekly commute'
  },
  {
    id: 4,
    date: '2025-09-28',
    amount: '3500',
    description: 'Electric bill',
    category: 'Bills & Utilities',
    aiSummary: 'Monthly electricity payment'
  },
  {
    id: 5,
    date: '2025-09-25',
    amount: '799',
    description: 'Netflix subscription',
    category: 'Entertainment',
    aiSummary: 'Monthly streaming service'
  }
];

const mockCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Other'
];

// Auth functions
export const login = async (username, password) => {
  console.log('USE_MOCK_API:', USE_MOCK_API);
  console.log('Environment variable:', process.env.NEXT_PUBLIC_USE_MOCK_API);
  console.log('Login attempt:', { username, password });
  
  if (USE_MOCK_API) {
    console.log('Using mock API');
    // Mock login for development
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // More forgiving comparison - trim whitespace and remove punctuation
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim().replace(/[^\w]/g, ''); // Remove non-word characters
    
    if (cleanUsername === 'demo' && cleanPassword === 'demo123') {
      console.log('Mock login successful');
      return {
        success: true,
        sessionToken: 'mock-session-token-' + Date.now()
      };
    } else {
      console.log('Mock login failed - invalid credentials');
      return {
        success: false,
        error: 'Invalid credentials. Use username: demo, password: demo123'
      };
    }
  }

  console.log('Using real Google Apps Script backend');
  console.log('API URL:', API_BASE_URL);

  try {
    const response = await api.post('', {
      action: 'login',
      username,
      password,
    });
    
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // If CORS error in development, provide helpful message
    if (error.message.includes('CORS') || error.message.includes('Network Error')) {
      return {
        success: false,
        error: 'CORS error - please deploy to production to use real backend'
      };
    }
    
    throw error;
  }
};

// Expense functions
export const addExpense = async (sessionToken, expenseData) => {
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Add to mock data (in real app, this would persist)
    const newExpense = {
      id: Date.now(),
      ...expenseData,
      aiSummary: `Added expense for ${expenseData.description}`
    };
    mockExpenses.unshift(newExpense);
    return { success: true, expense: newExpense };
  }

  console.log('Adding expense to Google Sheets:', expenseData);
  console.log('Session token:', sessionToken);
  console.log('API URL:', API_BASE_URL);

  try {
    const response = await api.post('', {
      action: 'addExpense',
      sessionToken,
      ...expenseData,
    });
    
    console.log('Add expense response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Add expense error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const getExpenses = async (sessionToken) => {
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      expenses: mockExpenses
    };
  }

  console.log('Fetching expenses from Google Sheets');
  console.log('Session token:', sessionToken);

  try {
    const response = await api.post('', {
      action: 'getExpenses',
      sessionToken,
    });
    
    console.log('Get expenses response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get expenses error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const getCategories = async (sessionToken) => {
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      categories: mockCategories
    };
  }

  const response = await api.post('', {
    action: 'getCategories',
    sessionToken,
  });
  return response.data;
};

// Session management
export const getSessionToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sessionToken');
  }
  return null;
};

export const setSessionToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sessionToken', token);
  }
};

export const removeSessionToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sessionToken');
  }
};

export const isSessionExpired = (error) => {
  return error && error.includes('Invalid or expired session');
};