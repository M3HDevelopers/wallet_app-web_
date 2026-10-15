# App Icons & Assets

## 🎨 Quick Setup (Easiest Method)

1. Open `icon-generator.html` in your browser
2. Click "Download Icon (1024x1024)" → Save as `icon.png`
3. Click "Download Adaptive Icon" → Save as `adaptive-icon.png`
4. Click "Download Splash Screen" → Save as `splash.png`
5. Move all 3 files to this `assets/` folder

That's it! Your app will have custom icons.

---

## 📁 Required Files

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | App icon (home screen, app store) |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon |
| `splash.png` | 1080×1920 | Splash screen (app loading) |

---

## 🎯 Design Specifications

### Colors
- **Primary Green**: `#376B4B` (Forest Green)
- **Background**: `#F7F7F3` (Warm Off-White)
- **Text**: `#20231F` (Near Black)

### Style
- Square corners (no rounded edges)
- Flat design (no gradients, no shadows)
- Minimal wallet icon with "Rs" symbol
- Clean, professional look

---

## 🛠️ Alternative: Create Your Own

### Online Tools
- **Figma**: https://figma.com (professional)
- **Canva**: https://canva.com (easy)
- **Photopea**: https://photopea.com (free Photoshop)

### AI Generators
- Midjourney
- DALL-E
- Stable Diffusion

### Prompt for AI:
```
Minimalist app icon for personal wallet/finance manager. 
Forest green (#376B4B) wallet symbol on warm off-white (#F7F7F3) background. 
Square shape, flat design, no rounded corners, no gradients. 
Clean, professional, modern. 1024x1024 pixels.
```

---

## ⚠️ Important Notes

1. **File names must match exactly**: `icon.png`, `adaptive-icon.png`, `splash.png`
2. **PNG format only** (not JPG, not SVG)
3. **No transparency** for splash screen
4. **Icons should be square** (1:1 aspect ratio)

---

## 🚀 After Adding Icons

```bash
# Rebuild the app
eas build --platform android --profile preview
```

Your new icons will appear in the APK!

---

## 📱 What You'll See

- **Home Screen**: Your custom wallet icon
- **App Switcher**: Your icon with app name
- **Splash Screen**: Icon + "Wallet Manager" text while loading
- **Settings**: Your icon in app info

---

## 🆘 Troubleshooting

**Problem**: Build fails with "icon not found"  
**Solution**: Make sure files are named exactly `icon.png`, `adaptive-icon.png`, `splash.png`

**Problem**: Icon looks blurry  
**Solution**: Use 1024×1024 pixels (not smaller)

**Problem**: Splash screen doesn't show  
**Solution**: Check `app.json` has correct splash configuration

---

## 📞 Need Help?

- Expo Icons Guide: https://docs.expo.dev/guides/app-icons/
- Splash Screen: https://docs.expo.dev/guides/splash-screens/

---

**Quick Start**: Just open `icon-generator.html` and download all 3 files! 🎉
