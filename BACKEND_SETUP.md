# Google Apps Script Backend Setup Guide

## 📋 Prerequisites

1. Google Account
2. Gemini API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Step-by-Step Setup

### 1. Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it to "Personal Expense Tracker"

### 2. Set up Apps Script

1. In your spreadsheet, go to **Extensions** → **Apps Script**
2. Delete the default `myFunction()` code
3. Copy and paste the entire contents of `code.gs` into the editor
4. Save the project (Ctrl+S)

### 3. Configure Gemini API

1. In Apps Script, go to **Project Settings** (gear icon)
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Add:
   - **Property**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from Google AI Studio

### 4. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Choose type: **Web app**
3. Set configuration:
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this for the frontend

### 5. Update Frontend Configuration

1. Open `.env.local` in your React project
2. Replace the URL with your new Web App URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

### 6. Test the Setup

1. In Apps Script, run the `testSetup()` function to verify everything works
2. Check the **Execution transcript** for any errors
3. Your spreadsheet should now have 3 tabs: `expenses`, `users`, `categories`

## 📊 Spreadsheet Structure

The script automatically creates these tabs:

### `expenses` tab
- **ID**: Unique expense identifier
- **Date**: Expense date
- **Amount**: Expense amount
- **Description**: User description
- **Category**: AI-generated category
- **AI Summary**: AI-generated summary
- **Created At**: Timestamp

### `users` tab
- **Username**: User login name
- **Password**: User password (plain text for demo)
- **Session Token**: Current session token
- **Last Login**: Last login timestamp

### `categories` tab
- **Category**: Category name
- **Description**: Category description

## 🤖 AI Features

The backend uses Gemini AI to:

1. **Auto-categorize expenses** based on description and amount
2. **Generate summaries** for each expense
3. **Provide insights** for reports

Categories include:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Travel
- Education
- Other

## 🔐 Security Notes

- **Demo purposes only**: Passwords are stored in plain text
- **Session tokens**: Expire after 24 hours
- **API access**: Anyone with the URL can access (for demo)

For production use, implement proper authentication and encryption.

## 🐛 Troubleshooting

### Common Issues:

1. **"Script function not found"**
   - Make sure you saved the script after pasting the code

2. **"Gemini API error"**
   - Verify your API key is correct in Script Properties
   - Check if you have Gemini API quota remaining

3. **"Permission denied"**
   - Re-deploy the web app with correct permissions
   - Make sure "Anyone" has access

4. **"Invalid session"**
   - Sessions expire after 24 hours
   - Try logging in again

### Testing Commands:

Run these in Apps Script to test:

```javascript
// Test AI analysis
testSetup();

// Test login
handleLogin({username: 'demo', password: 'demo123'});

// Check spreadsheet structure
initializeSpreadsheet();
```

## 🎯 Next Steps

Once setup is complete:

1. Update your frontend `.env.local` with the new URL
2. Set `USE_MOCK_API = false` in `src/utils/api.js`
3. Restart your React development server
4. Test login with username: `demo`, password: `demo123`

Your expense tracker will now use real Google Sheets storage with AI-powered categorization!