# 🚀 WALLET MANAGER - REACT NATIVE APP - COMPLETE GUIDE

## Bhai, sab ready hai! Ab bas yeh steps follow karo:

---

## 📱 APK BANANE KE STEPS (EASIEST METHOD)

### Step 1: Prerequisites Install Karo

1. **Node.js Install Karo:**
   - https://nodejs.org/ par jao
   - LTS version download karo
   - Install karo (Next > Next > Finish)

2. **Expo Account Banao:**
   - https://expo.dev/signup par jao
   - Free account banao
   - Username aur password yaad rakho

### Step 2: Project Setup

1. **Terminal/CMD open karo** (Windows: PowerShell, Mac: Terminal)

2. **Project folder mein jao:**
   ```bash
   cd path/to/react-native-app
   ```

3. **Dependencies install karo:**
   ```bash
   npm install
   ```
   Wait karo, 2-5 minutes lagenge.

### Step 3: APK Build Karo

1. **EAS CLI install karo:**
   ```bash
   npm install -g eas-cli
   ```

2. **Expo login karo:**
   ```bash
   eas login
   ```
   Apna username/password daalo.

3. **APK build start karo:**
   ```bash
   eas build --platform android --profile preview
   ```

4. **Questions aayenge:**
   - "Install EAS CLI?" → Yes
   - "Log in?" → Already logged in
   - "Select platform?" → Android
   - "Build type?" → APK (preview profile)

5. **Build complete hone ka wait karo:**
   - 15-30 minutes lagenge
   - Terminal mein progress dikhega
   - Complete hone par link milega

6. **APK Download Karo:**
   - Link par jao ya https://expo.dev/account par jao
   - "Builds" section mein jao
   - Latest build par click karo
   - "Download" button par click karo
   - APK file download ho jayegi

### Step 4: Phone Mein Install Karo

1. **APK file ko phone mein transfer karo:**
   - USB cable se
   - Email se
   - Google Drive se
   - WhatsApp se

2. **Phone mein install karo:**
   - File manager se APK file open karo
   - "Install" par click karo
   - Agar warning aaye: Settings > Security > Unknown Sources enable karo
   - Install complete karo

3. **App open karo aur use karo!**

---

## 🧪 PHONE PAR TEST KARNA (Development Mode)

Agar aap build se pehle test karna chahte hain:

1. **Phone mein "Expo Go" app install karo** (Play Store se)

2. **Terminal mein start karo:**
   ```bash
   npx expo start
   ```

3. **QR code scan karo:**
   - Terminal mein QR code dikhega
   - Expo Go app se scan karo
   - App phone par chal jayegi

4. **Real-time testing:**
   - Code change karo
   - Phone par automatically update hoga
   - Shake phone se developer menu open hoga

---

## 📂 PROJECT STRUCTURE

```
react-native-app/
│
├── App.tsx                    # Main entry point (navigation)
├── app.json                   # Expo config (app name, icon, splash)
├── eas.json                   # EAS Build config
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── babel.config.js            # Babel config
│
├── assets/                    # Images
│   ├── icon.png              # App icon (1024x1024)
│   ├── splash.png            # Splash screen
│   └── adaptive-icon.png     # Android adaptive icon
│
└── src/
    ├── screens/               # All screens
    │   ├── WelcomeScreen.tsx
    │   ├── SetupScreen.tsx
    │   ├── LockScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── TransactionsScreen.tsx
    │   ├── ReportsScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── AddMoneyScreen.tsx
    │   └── OtherScreens.tsx
    │
    ├── db/
    │   └── database.ts       # SQLite database operations
    │
    └── utils/
        ├── auth.ts           # Password hashing
        ├── currency.ts       # Currency formatting
        └── date.ts           # Date utilities
```

---

## 🎨 CUSTOMIZATION

### App Name Change Karo
`app.json` file edit karo:
```json
{
  "expo": {
    "name": "Mera Wallet",
    "slug": "mera-wallet"
  }
}
```

### Icon Change Karo
`assets/icon.png` file replace karo (1024x1024 px)

### Splash Screen Change Karo
`assets/splash.png` file replace karo (1284x2778 px recommended)

### Colors Change Karo
Screen files mein colors update karo:
- Primary Green: `#376B4B`
- Background: `#F7F7F3`
- Income: `#34764A`
- Expense: `#B84C43`

---

## 🔧 TROUBLESHOOTING

### Problem: "npm install" fail ho raha hai
**Solution:**
```bash
# Cache clear karo
npm cache clean --force

# Node modules delete karo
rm -rf node_modules

# Dobara install karo
npm install
```

### Problem: "eas: command not found"
**Solution:**
```bash
npm install -g eas-cli
```

### Problem: Build fail ho raha hai
**Solution:**
1. Expo website par jao: https://expo.dev
2. "Builds" section mein jao
3. Failed build par click karo
4. Error logs dekho
5. Common errors:
   - Missing dependencies → `npm install`
   - Invalid config → `app.json` check karo
   - Network error → Internet check karo

### Problem: APK install nahi ho raha
**Solution:**
1. Phone settings mein jao
2. Security > Unknown Sources enable karo
3. Old version uninstall karo
4. Dobara install karo

### Problem: App crash ho raha hai
**Solution:**
```bash
# Cache clear karo
npx expo start --clear

# Ya reinstall karo
rm -rf node_modules
npm install
```

---

## 📱 FEATURES LIST

### Authentication
✓ Password setup (first time)
✓ PIN setup (optional)
✓ Auto-lock
✓ Secure password storage (SHA-256)

### Dashboard
✓ Current balance display
✓ Hide/show balance
✓ Income/Expense summary
✓ Borrowed/Outstanding debt
✓ Quick actions (4 buttons)
✓ Recent transactions
✓ Pull to refresh

### Transactions
✓ Add income (6 types)
✓ Add expense (11 categories)
✓ Record borrowing
✓ Record repayment
✓ Transaction history
✓ Search transactions
✓ Filter by type
✓ Edit transaction
✓ Delete transaction

### Reports
✓ Daily summary
✓ Monthly summary
✓ Month navigation
✓ Category breakdown
✓ Net movement
✓ Visual bars

### Settings
✓ Change password
✓ PIN setup
✓ Hide balance toggle
✓ Reset all data
✓ Lock app

### Data
✓ SQLite local storage
✓ All data on device
✓ No internet required
✓ No cloud sync
✓ Persistent across restarts

---

## 🎯 NAVIGATION

### Bottom Tab Bar (4 tabs)
1. **Home** - Dashboard
2. **History** - Transaction list
3. **Reports** - Daily/Monthly reports
4. **Settings** - App settings

### Top Navigation
- **Back button** (‹) - Previous screen par jao
- **Title** - Current screen name

### Floating Action Button (FAB)
- **+** button on dashboard
- Quick add money

### Gestures
- **Swipe right** - Go back (on supported screens)
- **Pull down** - Refresh dashboard

---

## 💾 DATA STORAGE

### Database: SQLite
- Local storage
- No internet required
- Fast queries
- Transactional writes

### Tables:
1. **transactions** - All financial transactions
2. **categories** - Income/expense categories
3. **people** - People (lenders, payees)
4. **debts** - Borrowing records
5. **debt_repayments** - Repayment history
6. **settings** - App settings

### Security:
- Password: SHA-256 hashed with salt
- PIN: Stored in SecureStore
- No data sent to server
- All processing local

---

## 📊 FINANCIAL CALCULATIONS

### Balance Formula:
```
Current Balance = Opening Balance + Cash Inflows - Cash Outflows
```

### Cash Inflows:
- Earned income
- Gifts/Allowance
- Family money
- Money from person
- Borrowed money
- Loan repayment received
- Other income

### Cash Outflows:
- Expenses
- Debt repayments

### Important:
- Borrowed money increases balance BUT also increases outstanding debt
- Repayment decreases balance AND decreases outstanding debt
- Never counts borrowed money as "earned income"
- All amounts stored as integers (paisa) to avoid floating point errors

---

## 🔐 SECURITY NOTES

1. **Password**: SHA-256 hashed with 1000 iterations
2. **Salt**: Random 16-byte salt for each password
3. **Storage**: SecureStore (encrypted on device)
4. **PIN**: Stored separately in SecureStore
5. **No Cloud**: All data stays on device
6. **No Network**: App works offline

### Important:
- Password bhool gaye toh data recover nahi hoga
- Regular backup lena chahiye
- App uninstall karne se data delete ho jayega
- Factory reset se data delete ho jayega

---

## 📦 EXPORT/BACKUP (Future Feature)

Abhi backup feature complete nahi hai, lekin aap add kar sakte hain:

1. **JSON Export**: Saara data JSON file mein
2. **JSON Import**: JSON file se restore
3. **CSV Export**: Transactions CSV format mein

Code already database.ts mein hai, bas UI add karna hai.

---

## 🎓 LEARNING RESOURCES

### React Native:
- Official Docs: https://reactnative.dev/
- Expo Docs: https://docs.expo.dev/

### Navigation:
- React Navigation: https://reactnavigation.org/

### Database:
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/

### Styling:
- React Native Styles: https://reactnative.dev/docs/style

---

## ✅ CHECKLIST (Before Building APK)

- [ ] Node.js installed
- [ ] Expo account created
- [ ] `npm install` successful
- [ ] App tested on phone (Expo Go)
- [ ] All features working
- [ ] Icon and splash screen set
- [ ] App name customized
- [ ] EAS CLI installed
- [ ] Logged in to EAS
- [ ] Build started
- [ ] APK downloaded
- [ ] APK installed on phone
- [ ] App working correctly

---

## 🎉 CONGRATULATIONS!

Ab aapke paas complete React Native app hai jo:
- ✓ Android APK ban jayegi
- ✓ iOS app bhi ban sakti hai
- ✓ Professional UI/UX
- ✓ All features working
- ✓ Secure authentication
- ✓ Offline-first
- ✓ Native navigation
- ✓ Splash screen & icon

**Best of luck bhai! 🚀**

---

## 📞 SUPPORT

Agar koi problem aaye:
1. Error message copy karo
2. Google karo
3. Expo docs check karo: https://docs.expo.dev/
4. Stack Overflow par search karo
5. Expo forums: https://forums.expo.dev/

---

**Made with ❤️ for personal finance tracking**
