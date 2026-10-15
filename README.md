# Personal Wallet Manager - Mobile App

Ek complete personal finance tracking app jo bilkul native mobile app jaisi dikhti hai aur kaam karti hai.

## Features

### Core Features
- **Balance Tracking**: Real-time balance calculation with opening balance support
- **Transaction Management**: Income, expenses, borrowing, repayments
- **Categories**: Custom categories for income and expenses
- **People Tracking**: Track who you received money from or paid to
- **Debt Management**: Record borrowings and repayments with outstanding balance
- **Reports**: Daily and monthly summaries with category breakdowns
- **Search & Filter**: Find transactions quickly
- **Security**: Password + optional PIN protection
- **Data Export**: JSON backup and CSV export
- **Offline First**: All data stored locally, no internet required

### Mobile-Native Experience
- **Smooth Transitions**: Native-style page slide animations
- **Bottom Tab Navigation**: iOS/Android style tab bar
- **Bottom Sheets**: Native modal dialogs
- **Touch Optimized**: Large touch targets, haptic-like feedback
- **Safe Areas**: Proper handling of notches and home indicators
- **PWA Support**: Installable on home screen, works offline
- **No Rounded Corners**: Strict design system followed
- **Professional UI**: Clean, minimal, editorial finance app aesthetic

## Design System

### Colors
- Background: `#F7F7F3` (warm off-white)
- Surface: `#FFFFFF` (white)
- Primary Text: `#20231F` (near-black)
- Secondary Text: `#777B75` (muted gray)
- Accent: `#376B4B` (forest green)
- Income: `#34764A` (muted green)
- Expense: `#B84C43` (muted brick red)
- Border: `#E4E5DF` (light gray)

### Typography
- System font stack (SF Pro, Inter, Segoe UI)
- Tabular numbers for financial amounts
- Clear hierarchy with proper spacing

### UI Rules
- **Zero border-radius** on all elements (square corners)
- No gradients, no shadows, no glow effects
- No emojis, no decorative illustrations
- Subtle 1px borders for hierarchy
- Flat surfaces only

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Framer Motion** - Smooth animations
- **Lucide React** - Consistent icons
- **LocalStorage** - Data persistence
- **Web Crypto API** - Password hashing (SHA-256)

## Installation & Running

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### First Time Setup
1. Open the app
2. Create a password (min 8 characters)
3. Optionally set opening balance
4. Start tracking!

### Adding Transactions
- Tap the **+** button on dashboard
- Choose: Add Money, Add Expense, Record Borrowing, or Record Repayment
- Fill in details and save

### Viewing Reports
- Tap **Reports** tab
- Switch between Daily and Monthly views
- See category breakdowns and net movement

### Security
- Change password from Settings
- Enable PIN for quick unlock
- Hide balance option available
- Auto-lock when app is backgrounded

### Data Management
- Export backup (JSON) - Full data backup
- Export CSV - Transaction list
- Restore backup - Import from JSON file
- Reset all data - Clear everything (with confirmation)

## Financial Calculations

### Balance Formula
```
Current Balance = Opening Balance + Cash Inflows - Cash Outflows
```

### Transaction Types
- **Income Types**: Earned, Gift, Family, Person, Borrowed, Loan Repayment, Other
- **Expense Types**: All expense categories
- **Cash In**: All income types increase balance
- **Cash Out**: Expenses and repayments decrease balance

### Debt Tracking
- Borrowing increases cash AND outstanding debt
- Repayment decreases cash AND outstanding debt
- Never counts borrowed money as income

## Data Storage

All data is stored in browser's LocalStorage:
- Transactions
- Categories
- People
- Debts & Repayments
- Settings
- Authentication (hashed password)

**Important**: 
- Data persists across sessions
- Clearing browser data will delete everything
- Regular backups recommended
- No cloud sync (by design)

## Browser Compatibility

Works on:
- Chrome/Edge (Desktop & Mobile)
- Safari (iOS)
- Firefox
- Samsung Internet

**Mobile Optimization**:
- Designed for mobile-first experience
- Works beautifully on phones and tablets
- Installable as PWA on home screen
- Offline capable

## Security Notes

- Passwords are hashed using SHA-256 with salt
- 10,000 iterations for security
- PIN stored in LocalStorage (device-level encryption recommended)
- No data sent to any server
- All processing happens locally

## Future Enhancements (Optional)

- Biometric authentication (Face ID/Touch ID)
- Recurring transactions
- Budget tracking
- More detailed reports
- Dark mode
- Multi-currency support
- Cloud backup (encrypted)

## License

Personal use application. All data stays on your device.

---

**Note**: Yeh app web technology par based hai lekin bilkul native mobile app jaisi feel deti hai. Agar aapko actual React Native app chahiye (jo app stores par publish ho sake), toh aapko Expo CLI aur Android/iOS development environment setup karna hoga separately.
