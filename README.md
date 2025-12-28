# 💰 Finance Management Web

A modern, client-side finance management web application built with React, TypeScript, and SQL.js. Manage your income, expenses, budgets, and bank balances entirely in your browser with no backend required.

## ✨ Features

### 📊 Core Functionality
- **Transaction Management**: Track income and expenses with detailed categorization
- **Budget Planning**: Set and monitor monthly budgets by category
- **Category Management**: Organize transactions with customizable categories (income/expense)
- **Bank Balance Tracking**: Monitor opening and closing balances by month
- **Data Persistence**: All data stored locally in your browser using SQL.js

### 🛠️ Technical Features
- **Client-Side Database**: SQL.js-powered SQLite database running entirely in the browser
- **Repository Pattern**: Clean architecture with repository-based data access
- **Type Safety**: Full TypeScript support for type-safe development
- **Database Debugger**: Built-in debugging tool to inspect database state and data
- **Modern UI**: Responsive design with modern React patterns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Finance-Management-Web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run serve` - Alias for preview (serve production build)
- `npm run lint` - Run ESLint to check code quality

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   └── debug/          # Database debugger component
├── hooks/              # Custom React hooks
│   └── useDatabaseSetup.ts  # Database initialization hook
├── services/           # Business logic and services
│   └── database/       # Database layer
│       ├── repositories/   # Data access layer (Repository pattern)
│       ├── schemas/        # Database schemas and types
│       ├── services/       # Database utility services
│       └── DatabaseService.ts  # Main database service
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## 🗄️ Database Schema

The application uses SQL.js to create and manage the following tables:

- **categories**: Transaction categories (income/expense types)
- **budgets**: Monthly budget allocations by category
- **transactions**: Individual income and expense records
- **bank_balances**: Monthly bank balance tracking

## 🔧 Database Debugger

The application includes a built-in database debugger component (`DatabaseDebugger`) that provides:

- Real-time database status monitoring
- Data overview and statistics
- Detailed table views
- Data export functionality (JSON format)
- Database testing and reset capabilities
- Operation logging

Access it by including the `DatabaseDebugger` component in your app.

## 📦 Technologies Used

- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **SQL.js** - Client-side SQLite database
- **ESLint** - Code linting

## 🚢 Deployment

### GitHub Pages Deployment

The project includes a deployment script for GitHub Pages:

```bash
./deploy-gh-pages.sh
```

The script will:
1. Build the project with the correct base path
2. Create/update the `gh-pages` branch
3. Deploy to GitHub Pages

**Note**: Make sure you're on the `main` or `master` branch and have committed all changes before running the deployment script.

After deployment:
1. Go to your GitHub repository Settings → Pages
2. Select "Deploy from a branch"
3. Choose the `gh-pages` branch
4. Your site will be available at `https://yourusername.github.io/Finance-Management-Web`

## 🎯 Development

### Adding New Features

1. **Database Changes**: Update schemas in `src/services/database/schemas/`
2. **Data Access**: Create or update repositories in `src/services/database/repositories/`
3. **UI Components**: Add components in `src/components/`
4. **Business Logic**: Add services in `src/services/`

### Database Initialization

The database is automatically initialized when the app loads using the `useDatabaseSetup` hook. It:
- Creates all necessary tables
- Sets up indexes for performance
- Inserts default categories if the database is new

## 📝 License

This project is private and not licensed for public use.

## 🤝 Contributing

This is a personal project. Contributions are welcome but please open an issue first to discuss any changes.

---

Built with ❤️ using React, TypeScript, and SQL.js
