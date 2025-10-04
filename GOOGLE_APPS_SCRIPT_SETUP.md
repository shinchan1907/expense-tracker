# Google Apps Script Backend Setup Guide

This guide will help you set up the Google Apps Script backend for your Expense Tracker application.

## Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Personal Expense Tracker"

## Step 2: Set Up Apps Script

1. In your spreadsheet, go to **Extensions > Apps Script**
2. Delete any default code in the editor
3. Copy the entire contents of `code.gs` from this project
4. Paste it into the Apps Script editor
5. Save the project (Ctrl+S or Cmd+S)
6. Name it "Expense Tracker Backend"

## Step 3: Configure Gemini API (Optional but Recommended)

The AI categorization feature requires a Gemini API key.

1. Get your API key:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Get API Key"
   - Create a new API key or use an existing one
   - Copy the API key

2. Add it to Script Properties:
   - In Apps Script editor, click the gear icon (⚙️) on the left sidebar
   - Click **Project Settings**
   - Scroll down to **Script Properties**
   - Click **Add script property**
   - Property name: `GEMINI_API_KEY`
   - Value: Paste your API key
   - Click **Save**

> **Note:** Without the Gemini API key, expenses will still work but will use basic keyword-based categorization instead of AI.

## Step 4: Test the Setup

1. In Apps Script editor, select the function `testSetup` from the dropdown at the top
2. Click the **Run** button (▶️)
3. The first time you run it, you'll need to authorize the script:
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to Expense Tracker Backend (unsafe)**
   - Click **Allow**
4. Check the **Execution log** at the bottom to see test results
5. Verify that three sheets were created in your spreadsheet:
   - `expenses`
   - `users`
   - `categories`

## Step 5: Deploy as Web App

1. In Apps Script editor, click **Deploy > New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure deployment:
   - **Description:** "Expense Tracker API"
   - **Execute as:** "Me"
   - **Who has access:** "Anyone"
5. Click **Deploy**
6. Click **Authorize access** and grant permissions
7. **Copy the Web app URL** - you'll need this for the frontend

The URL will look like:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## Step 6: Connect Frontend to Backend

1. Open the `.env` file in your project
2. Replace the `NEXT_PUBLIC_API_BASE_URL` with your Web app URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. Save the file

## Step 7: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Log in with the demo credentials:
   - **Username:** demo
   - **Password:** demo123

4. Try adding an expense to verify the connection

## Default Demo Account

The backend automatically creates a demo user:
- **Username:** demo
- **Password:** demo123

You can add more users by editing the "users" sheet in your spreadsheet.

## Spreadsheet Structure

### expenses Sheet
| ID | Date | Amount | Description | Category | AI Summary | Created At |

### users Sheet
| Username | Password | Session Token | Last Login |

### categories Sheet
| Category | Description |

## Updating the Backend

If you need to update the backend code:

1. Edit the code in Apps Script editor
2. Save the changes (Ctrl+S or Cmd+S)
3. Go to **Deploy > Manage deployments**
4. Click the pencil icon (✏️) next to your deployment
5. Click **Version > New version**
6. Click **Deploy**

> **Note:** No need to update the URL in your frontend - it stays the same!

## Troubleshooting

### "CORS error" in browser console
- This is normal during local development
- The app will automatically use mock data
- Deploy to production or use the real backend URL to test with actual data

### "Invalid or expired session" error
- Session tokens expire after 24 hours
- Simply log in again to get a new session

### AI categorization not working
- Check that GEMINI_API_KEY is set in Script Properties
- Verify your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check the Execution log in Apps Script for errors

### Expenses not saving
- Check the Execution log in Apps Script for errors
- Verify the "expenses" sheet exists and has the correct headers
- Make sure you're logged in with a valid session

## Security Notes

- Session tokens expire after 24 hours of inactivity
- Passwords are stored in plain text (for demo purposes only)
- For production use, implement proper password hashing
- The "Anyone" access setting means anyone with the URL can use the API
- Consider implementing additional security measures for production

## Next Steps

- Add more users to the "users" sheet
- Customize categories in the "categories" sheet
- Monitor expenses in real-time through the spreadsheet
- Export data for further analysis using Google Sheets tools
