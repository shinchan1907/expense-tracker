/**
 * Personal Expense Tracker - Google Apps Script Backend
 * 
 * Setup Instructions:
 * 1. Create a new Google Spreadsheet
 * 2. Create 3 tabs: "expenses", "users", "categories"
 * 3. Go to Extensions > Apps Script
 * 4. Replace Code.gs with this file
 * 5. Set Script Properties: GEMINI_API_KEY (get from Google AI Studio)
 * 6. Deploy as Web App with execute permissions for "Anyone"
 */

// Configuration
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

// Initialize spreadsheet tabs if they don't exist
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create expenses tab
  let expensesSheet = ss.getSheetByName('expenses');
  if (!expensesSheet) {
    expensesSheet = ss.insertSheet('expenses');
    expensesSheet.getRange('A1:G1').setValues([['ID', 'Date', 'Amount', 'Description', 'Category', 'AI Summary', 'Created At']]);
    expensesSheet.getRange('A1:G1').setFontWeight('bold');
  }
  
  // Create users tab
  let usersSheet = ss.getSheetByName('users');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('users');
    usersSheet.getRange('A1:D1').setValues([['Username', 'Password', 'Session Token', 'Last Login']]);
    usersSheet.getRange('A1:D1').setFontWeight('bold');
    // Add demo user
    usersSheet.getRange('A2:B2').setValues([['demo', 'demo123']]);
  }
  
  // Create categories tab
  let categoriesSheet = ss.getSheetByName('categories');
  if (!categoriesSheet) {
    categoriesSheet = ss.insertSheet('categories');
    categoriesSheet.getRange('A1:B1').setValues([['Category', 'Description']]);
    categoriesSheet.getRange('A1:B1').setFontWeight('bold');
    
    // Add default categories
    const defaultCategories = [
      ['Food & Dining', 'Restaurants, groceries, coffee, etc.'],
      ['Transportation', 'Gas, public transport, rideshare, etc.'],
      ['Shopping', 'Clothing, electronics, general purchases'],
      ['Entertainment', 'Movies, games, subscriptions, etc.'],
      ['Bills & Utilities', 'Rent, electricity, internet, phone'],
      ['Healthcare', 'Medical, pharmacy, insurance'],
      ['Travel', 'Hotels, flights, vacation expenses'],
      ['Education', 'Books, courses, training'],
      ['Other', 'Miscellaneous expenses']
    ];
    
    categoriesSheet.getRange(2, 1, defaultCategories.length, 2).setValues(defaultCategories);
  }
}

// Handle GET requests (when someone visits the URL directly)
function doGet(e) {
  const response = {
    message: 'Personal Expense Tracker API',
    status: 'Active',
    version: '1.0',
    endpoints: {
      login: 'POST with action: "login"',
      addExpense: 'POST with action: "addExpense"',
      getExpenses: 'POST with action: "getExpenses"',
      getCategories: 'POST with action: "getCategories"'
    },
    note: 'This API only accepts POST requests with JSON data'
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}



// Main entry point for web app
function doPost(e) {
  try {
    // Initialize spreadsheet on first run
    initializeSpreadsheet();

    // Handle empty or malformed requests
    if (!e.postData || !e.postData.contents) {
      throw new Error('No data received');
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (!action) {
      throw new Error('No action specified');
    }

    let result;
    switch (action) {
      case 'login':
        result = handleLogin(data);
        break;
      case 'addExpense':
        result = handleAddExpense(data);
        break;
      case 'getExpenses':
        result = handleGetExpenses(data);
        break;
      case 'getCategories':
        result = handleGetCategories(data);
        break;
      default:
        result = {
          success: false,
          error: 'Invalid action'
        };
    }

    // Return with CORS headers
    const output = ContentService.createTextOutput(JSON.stringify(result));
    output.setMimeType(ContentService.MimeType.JSON);

    // Add CORS headers to allow cross-origin requests
    return output;

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    const output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Server error: ' + error.toString()
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// Handle user login
function handleLogin(data) {
  try {
    const { username, password } = data;
    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const userData = usersSheet.getDataRange().getValues();
    
    // Find user
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0] === username && userData[i][1] === password) {
        // Generate session token
        const sessionToken = 'session_' + Utilities.getUuid() + '_' + Date.now();
        
        // Update session token and last login
        usersSheet.getRange(i + 1, 3).setValue(sessionToken);
        usersSheet.getRange(i + 1, 4).setValue(new Date());
        
        return {
          success: true,
          sessionToken: sessionToken
        };
      }
    }
    
    return {
      success: false,
      error: 'Invalid username or password'
    };
  } catch (error) {
    Logger.log('Login error: ' + error.toString());
    return {
      success: false,
      error: 'Login failed'
    };
  }
}

// Validate session token
function validateSession(sessionToken) {
  try {
    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const userData = usersSheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][2] === sessionToken) {
        // Check if session is not too old (24 hours)
        const lastLogin = new Date(userData[i][3]);
        const now = new Date();
        const hoursDiff = (now - lastLogin) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    Logger.log('Session validation error: ' + error.toString());
    return false;
  }
}

// Get AI categorization and summary using Gemini
function getAIAnalysis(description, amount) {
  try {
    if (!GEMINI_API_KEY) {
      Logger.log('GEMINI_API_KEY not found in Script Properties');
      return {
        category: 'Other',
        summary: 'Expense recorded'
      };
    }
    
    const prompt = `Analyze this expense and provide:
1. The most appropriate category from: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Other
2. A brief 1-sentence summary

Expense: "${description}" for ₹${amount}

Respond in JSON format:
{
  "category": "category_name",
  "summary": "brief summary"
}`;

    const response = UrlFetchApp.fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const responseData = JSON.parse(response.getContentText());
    
    if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
      const aiText = responseData.candidates[0].content.parts[0].text;
      
      // Try to parse JSON response
      try {
        const aiAnalysis = JSON.parse(aiText);
        return {
          category: aiAnalysis.category || 'Other',
          summary: aiAnalysis.summary || 'AI-analyzed expense'
        };
      } catch (parseError) {
        // If JSON parsing fails, extract category and summary manually
        const categoryMatch = aiText.match(/"category":\s*"([^"]+)"/);
        const summaryMatch = aiText.match(/"summary":\s*"([^"]+)"/);
        
        return {
          category: categoryMatch ? categoryMatch[1] : 'Other',
          summary: summaryMatch ? summaryMatch[1] : 'AI-analyzed expense'
        };
      }
    }
    
    // Fallback if AI fails
    return {
      category: 'Other',
      summary: 'Expense recorded'
    };
    
  } catch (error) {
    Logger.log('AI Analysis error: ' + error.toString());
    // Fallback categorization based on keywords
    const desc = description.toLowerCase();
    let category = 'Other';
    
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('coffee') || desc.includes('grocery')) {
      category = 'Food & Dining';
    } else if (desc.includes('gas') || desc.includes('uber') || desc.includes('transport')) {
      category = 'Transportation';
    } else if (desc.includes('shop') || desc.includes('store') || desc.includes('amazon')) {
      category = 'Shopping';
    } else if (desc.includes('movie') || desc.includes('netflix') || desc.includes('game')) {
      category = 'Entertainment';
    } else if (desc.includes('rent') || desc.includes('electric') || desc.includes('bill')) {
      category = 'Bills & Utilities';
    }
    
    return {
      category: category,
      summary: `${description} expense`
    };
  }
}

// Handle adding new expense
function handleAddExpense(data) {
  try {
    const { sessionToken, date, amount, description } = data;
    
    // Validate session
    if (!validateSession(sessionToken)) {
      return {
        success: false,
        error: 'Invalid or expired session'
      };
    }
    
    // Get AI analysis
    const aiAnalysis = getAIAnalysis(description, amount);
    
    // Add to expenses sheet
    const expensesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('expenses');
    const expenseId = 'exp_' + Date.now();
    const createdAt = new Date();
    
    expensesSheet.appendRow([
      expenseId,
      date,
      parseFloat(amount),
      description,
      aiAnalysis.category,
      aiAnalysis.summary,
      createdAt
    ]);
    
    return {
      success: true,
      expense: {
        id: expenseId,
        date: date,
        amount: amount,
        description: description,
        category: aiAnalysis.category,
        aiSummary: aiAnalysis.summary,
        createdAt: createdAt
      }
    };
    
  } catch (error) {
    Logger.log('Add expense error: ' + error.toString());
    return {
      success: false,
      error: 'Failed to add expense'
    };
  }
}

// Handle getting expenses
function handleGetExpenses(data) {
  try {
    const { sessionToken } = data;
    
    // Validate session
    if (!validateSession(sessionToken)) {
      return {
        success: false,
        error: 'Invalid or expired session'
      };
    }
    
    const expensesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('expenses');
    const expenseData = expensesSheet.getDataRange().getValues();
    
    // Skip header row and convert to objects
    const expenses = [];
    for (let i = 1; i < expenseData.length; i++) {
      expenses.push({
        id: expenseData[i][0],
        date: expenseData[i][1],
        amount: expenseData[i][2].toString(),
        description: expenseData[i][3],
        category: expenseData[i][4],
        aiSummary: expenseData[i][5],
        createdAt: expenseData[i][6]
      });
    }
    
    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
      success: true,
      expenses: expenses
    };
    
  } catch (error) {
    Logger.log('Get expenses error: ' + error.toString());
    return {
      success: false,
      error: 'Failed to get expenses'
    };
  }
}

// Handle getting categories
function handleGetCategories(data) {
  try {
    const { sessionToken } = data;
    
    // Validate session
    if (!validateSession(sessionToken)) {
      return {
        success: false,
        error: 'Invalid or expired session'
      };
    }
    
    const categoriesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('categories');
    const categoryData = categoriesSheet.getDataRange().getValues();
    
    // Skip header row and extract category names
    const categories = [];
    for (let i = 1; i < categoryData.length; i++) {
      categories.push(categoryData[i][0]);
    }
    
    return {
      success: true,
      categories: categories
    };
    
  } catch (error) {
    Logger.log('Get categories error: ' + error.toString());
    return {
      success: false,
      error: 'Failed to get categories'
    };
  }
}

// Test function to verify setup
function testSetup() {
  Logger.log('Testing setup...');
  
  // Initialize spreadsheet
  initializeSpreadsheet();
  Logger.log('Spreadsheet initialized');
  
  // Test login
  const loginResult = handleLogin({ username: 'demo', password: 'demo123' });
  Logger.log('Login test: ' + JSON.stringify(loginResult));
  
  if (loginResult.success) {
    // Test adding expense
    const expenseResult = handleAddExpense({
      sessionToken: loginResult.sessionToken,
      date: '2025-01-03',
      amount: '500',
      description: 'Test Coffee'
    });
    Logger.log('Add expense test: ' + JSON.stringify(expenseResult));
    
    // Test getting expenses
    const getResult = handleGetExpenses({ sessionToken: loginResult.sessionToken });
    Logger.log('Get expenses test: ' + JSON.stringify(getResult));
  }
  
  // Test Gemini API (if configured)
  if (GEMINI_API_KEY) {
    const testAnalysis = getAIAnalysis('Coffee at Cafe Coffee Day', '150');
    Logger.log('AI Analysis test: ' + JSON.stringify(testAnalysis));
  } else {
    Logger.log('GEMINI_API_KEY not configured - skipping AI test');
  }
  
  Logger.log('Setup test complete!');
}