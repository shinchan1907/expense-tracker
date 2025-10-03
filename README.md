# Personal Expense Tracker

A beautiful, iOS-style expense tracking app built with Next.js and TailwindCSS that connects to your Google Apps Script backend.

## Features

- 🔐 **Secure Authentication** - Login with session management
- 📊 **Dashboard** - Monthly spending overview and quick actions
- ➕ **Add Expenses** - Simple form with categories and date selection
- 📋 **Expense List** - View all expenses with AI summaries
- � **MReports & Analytics** - Comprehensive charts and insights
  - Category-wise pie charts
  - Monthly spending trends
  - Daily expense tracking
  - AI-powered spending categorization
  - Smart insights and tips
- 📱 **Mobile-First** - iOS-inspired design with smooth animations
- 🔄 **Auto-Logout** - Handles session expiration gracefully

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: TailwindCSS with custom iOS theme
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date manipulation
- **API**: Axios for HTTP requests
- **Backend**: Google Apps Script (provided separately)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Update `NEXT_PUBLIC_API_BASE_URL` with your Google Apps Script URL.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- Username: `demo`
- Password: `demo123`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variable `NEXT_PUBLIC_API_BASE_URL`
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify
3. Set environment variables in Netlify dashboard

## API Integration

The app connects to a Google Apps Script backend with these endpoints:

- `POST /exec` with `action: "login"` - User authentication
- `POST /exec` with `action: "addExpense"` - Add new expense
- `POST /exec` with `action: "getExpenses"` - Fetch all expenses
- `POST /exec` with `action: "getCategories"` - Get expense categories

## Project Structure

```
src/
├── components/
│   ├── LoginForm.jsx      # Authentication form
│   ├── Dashboard.jsx      # Main dashboard view
│   ├── ExpenseForm.jsx    # Add expense form
│   ├── ExpenseList.jsx    # List all expenses
│   └── Reports.jsx        # Analytics and charts
├── pages/
│   ├── _app.js           # Next.js app wrapper
│   └── index.js          # Main app with routing
├── styles/
│   └── globals.css       # Global styles and components
└── utils/
    └── api.js            # API functions and session management
```

## Customization

### Colors
Modify the iOS color palette in `tailwind.config.js`:

```js
colors: {
  ios: {
    blue: '#007AFF',
    green: '#34C759',
    // ... add your colors
  }
}
```

### Categories
Default categories are defined in `ExpenseForm.jsx` as fallback. Your backend should provide the actual categories via the API.

### Reports & Analytics
The Reports page includes:

**Charts & Visualizations**
- **Pie Chart**: Category-wise expense breakdown
- **Bar Chart**: Monthly spending trends over time
- **Line Chart**: Daily expense tracking
- **Stacked Bar**: AI-categorized spending (Essentials vs Utilities vs Discretionary)

**Filters**
- Date range selection
- Category filtering
- Real-time chart updates

**AI Insights**
- Spending pattern analysis
- Budget recommendations
- Category-based tips
- Automated expense categorization

## License

MIT License - feel free to use this for your personal projects!