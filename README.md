# Income & Expense Tracker App

A beautiful and modern React Native app for tracking personal income, expenses, and transfers with comprehensive financial insights and analytics.

## 🚀 Features

### Core Functionality
- **Transaction Management**: Add, edit, and delete income, expense, and transfer transactions
- **Account Management**: Multiple account types (cash, bank, credit card, etc.)
- **Category System**: Customizable categories with colors and icons
- **Smart Filtering**: Filter transactions by type, date, account, category, and tags
- **Search**: Full-text search across transaction notes, tags, and related data

### Financial Insights
- **Dashboard**: Monthly overview with KPIs, account balances, and recent activity
- **Reports**: Detailed financial reports with category breakdowns
- **Analytics**: Monthly/yearly comparisons and spending trends
- **Export**: CSV export for data portability

### User Experience
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Dark/Light Theme**: Automatic theme switching based on system preference
- **Offline Support**: Full offline functionality with local data storage
- **Responsive Design**: Optimized for both iOS and Android

### Advanced Features
- **Tags System**: Organize transactions with custom tags
- **Attachments**: Add photos and documents to transactions
- **Data Backup**: Local backup and restore functionality
- **Security**: Optional biometric authentication

## 📱 Screenshots

*Screenshots will be added here*

## 🛠 Tech Stack

- **Framework**: React Native CLI (TypeScript)
- **State Management**: Redux Toolkit + RTK Query
- **Navigation**: React Navigation v7
- **UI Components**: Custom design system with React Native Reanimated
- **Storage**: AsyncStorage for local data persistence
- **Development**: json-server for API mocking

## 📋 Prerequisites

- Node.js >= 20
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- JDK 11 or newer

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd in_out
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install iOS Dependencies (macOS only)

```bash
cd ios && pod install && cd ..
```

### 4. Start the Development Server

```bash
# Start the mock API server
npm run api

# In a new terminal, start the React Native development server
npm start
```

### 5. Run the App

```bash
# For iOS (macOS only)
npm run ios

# For Android
npm run android
```

## 🏗 Project Structure

```
src/
├── app/                    # App initialization & providers
│   ├── App.tsx            # Main app component
│   ├── navigation/        # Navigation configuration
│   └── providers/         # Context providers
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── screens/              # Screen components
│   ├── dashboard/        # Dashboard screens
│   ├── transactions/     # Transaction screens
│   ├── add/             # Add transaction screen
│   ├── reports/         # Reports screens
│   └── settings/        # Settings screens
├── features/            # Feature-based modules
│   ├── transactions/    # Transaction feature
│   ├── accounts/        # Account feature
│   └── categories/      # Category feature
├── state/               # Redux state management
│   ├── store.ts         # Store configuration
│   ├── api.ts           # RTK Query API
│   └── slices/          # Redux slices
├── services/            # External services
│   └── storage/         # Storage services
├── theme/               # Design system
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=http://localhost:3001
API_TIMEOUT=10000

# App Configuration
APP_NAME=Income & Expense Tracker
APP_VERSION=1.0.0

# Development
IS_DEV=true
```

### Development vs Production

The app automatically switches between development and production modes:

- **Development**: Uses json-server for API mocking
- **Production**: Uses AsyncStorage for local data persistence

## 📊 Data Model

### Transaction
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  accountId: string;
  accountIdTo?: string; // For transfers
  categoryId?: string; // Null for transfers
  amount: number;
  currencyCode: string;
  date: string;
  note?: string;
  tags: string[];
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Account
```typescript
interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'wallet' | 'card' | 'other';
  openingBalance: number;
  currencyCode: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  parentId?: string; // For hierarchical categories
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 Design System

The app uses a comprehensive design system with:

- **Colors**: Semantic color palette with light/dark variants
- **Typography**: Consistent font sizes and weights
- **Spacing**: 8px grid system
- **Shadows**: Elevation system for depth
- **Animations**: Smooth transitions and micro-interactions

## 🔄 State Management

The app uses Redux Toolkit with RTK Query for:

- **API State**: Automatic caching, invalidation, and synchronization
- **UI State**: Filters, preferences, and navigation state
- **Local State**: Form data and temporary UI state

## 📱 Platform Support

- **iOS**: iOS 14+ (iPhone and iPad)
- **Android**: Android 8+ (API level 26+)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📦 Building for Production

### Android

```bash
# Generate release APK
cd android
./gradlew assembleRelease
```

### iOS

```bash
# Open Xcode and build for release
cd ios
open in_out.xcworkspace
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for the amazing framework
- Redux Toolkit team for excellent state management tools
- React Navigation for seamless navigation experience
- All contributors and users of this app

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Made with ❤️ by the Income & Expense Tracker Team**
