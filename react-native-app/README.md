# Personal Wallet Manager - React Native App

Yeh ek complete React Native (Expo) mobile app hai jo Android APK ban jayegi.

## Features

- Password/PIN authentication
- Dashboard with real-time balance
- Add income, expenses, borrowings, repayments
- Transaction history with search & filters
- Daily/Monthly reports with category breakdown
- Debt tracking
- Settings with data export/import
- Native mobile navigation (back, home, tabs)
- Splash screen & custom icon
- Offline-first (SQLite database)

## Setup Instructions

### Prerequisites

1. **Node.js** (version 18 or higher)
   - Download: https://nodejs.org/
   - Install karein

2. **Expo CLI** (automatically install hoga)

3. **Android Studio** (APK build karne ke liye)
   - Download: https://developer.android.com/studio
   - Install karein with Android SDK

### Installation Steps

1. **Folder ko extract karein** (agar zip mein hai)

2. **Terminal/CMD open karein** aur project folder mein jayein:
   ```bash
   cd react-native-app
   ```

3. **Dependencies install karein**:
   ```bash
   npm install
   ```

4. **Expo start karein** (development ke liye):
   ```bash
   npx expo start
   ```

5. **Mobile par test karein**:
   - Android phone mein "Expo Go" app install karein (Play Store se)
   - QR code scan karein jo terminal mein dikhega
   - App phone par chal jayegi

## APK Build Instructions

### Method 1: EAS Build (Recommended - Cloud Build)

Yeh sabse easy method hai. Aapko Android Studio ki zaroorat nahi.

1. **Expo account banayein** (agar nahi hai):
   ```bash
   npx expo login
   ```
   - https://expo.dev/signup par account banayein

2. **EAS CLI install karein**:
   ```bash
   npm install -g eas-cli
   ```

3. **APK build karein**:
   ```bash
   eas build --platform android --profile preview
   ```

4. **Build complete hone par**:
   - Expo website par jayein: https://expo.dev
   - "Builds" section mein jayein
   - APK download karein
   - Phone mein install karein

**Note**: Pehli baar build mein 15-30 minutes lag sakte hain.

### Method 2: Local Build (Android Studio Required)

Agar aap locally build karna chahte hain:

1. **Android Studio install karein**:
   - https://developer.android.com/studio
   - SDK Manager se Android SDK install karein
   - Environment variables set karein:
     - `ANDROID_HOME`: Android SDK path
     - `PATH`: `%ANDROID_HOME%\platform-tools` add karein

2. **Prebuild karein**:
   ```bash
   npx expo prebuild --platform android
   ```

3. **Android folder mein jayein**:
   ```bash
   cd android
   ```

4. **APK build karein**:
   ```bash
   ./gradlew assembleRelease
   ```

5. **APK location**:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

6. **Phone mein install karein**:
   - APK file ko phone mein transfer karein
   - "Unknown sources" enable karein phone settings mein
   - APK install karein

### Method 3: Expo Development Build

Agar aap custom native code use karna chahte hain:

1. **Development build create karein**:
   ```bash
   eas build --platform android --profile development
   ```

2. **Downloaded APK install karein** phone mein

3. **Development server se connect karein**:
   ```bash
   npx expo start --dev-client
   ```

## Project Structure

```
react-native-app/
├── App.tsx                 # Main entry point
├── app.json               # Expo configuration
├── eas.json              # EAS Build configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── babel.config.js       # Babel config
├── assets/               # Images
│   ├── icon.png         # App icon
│   ├── splash.png       # Splash screen
│   └── adaptive-icon.png # Android adaptive icon
└── src/
    ├── screens/          # All screens
    │   ├── WelcomeScreen.tsx
    │   ├── SetupScreen.tsx
    │   ├── LockScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── TransactionsScreen.tsx
    │   ├── ReportsScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── AddMoneyScreen.tsx
    │   └── OtherScreens.tsx
    ├── db/
    │   └── database.ts   # SQLite database
    └── utils/
        ├── auth.ts       # Password hashing
        ├── currency.ts   # Currency formatting
        └── date.ts       # Date utilities
```

## Features Detail

### Authentication
- Password setup on first launch
- Optional PIN for quick unlock
- SHA-256 password hashing
- Secure storage using expo-secure-store

### Dashboard
- Current balance display
- Income/Expense/Borrowed/Outstanding summary
- Quick actions (Add Money, Expense, Borrow, Repay)
- Recent transactions list
- Hide balance option

### Transactions
- Add income (earned, gift, family, borrowed, etc.)
- Add expenses with categories
- Record borrowings with lender details
- Record repayments
- Transaction history with search & filters
- Edit/Delete transactions

### Reports
- Daily summary
- Monthly summary with month navigation
- Category-wise expense breakdown
- Net movement calculation

### Settings
- Change password
- PIN setup
- Hide balance toggle
- Reset all data

### Data Storage
- SQLite database (local)
- All data stays on device
- No internet required
- No cloud sync (by design)

## Customization

### Change App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change Colors
Edit screen files and update color codes:
- Primary: `#376B4B` (forest green)
- Background: `#F7F7F3` (warm off-white)
- Income: `#34764A` (muted green)
- Expense: `#B84C43` (muted red)

### Change Icon/Splash
Replace files in `assets/` folder:
- `icon.png` - 1024x1024 px
- `splash.png` - 1284x2778 px (or any aspect ratio)
- `adaptive-icon.png` - 1024x1024 px

## Troubleshooting

### Build fails with "SDK not found"
- Android Studio install karein
- SDK Manager se SDK install karein
- Environment variables set karein

### "EAS not recognized" error
```bash
npm install -g eas-cli
```

### App crashes on launch
- Check terminal for error messages
- `npx expo start --clear` se cache clear karein
- `node_modules` delete karke `npm install` dubara karein

### APK install nahi ho raha
- Phone mein "Unknown sources" enable karein
- Settings > Security > Unknown sources
- Old version uninstall karein pehle

## Support

Agar koi problem aaye:
1. Terminal mein error message dekhein
2. `npx expo start --clear` try karein
3. Node modules reinstall karein
4. Expo documentation: https://docs.expo.dev/

## License

Personal use application. All data stays on your device.

---

**Note**: Yeh app React Native (Expo) par based hai aur Android/iOS dono par chalegi. APK banane ke liye EAS Build sabse easy method hai.
