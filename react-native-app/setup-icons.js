#!/usr/bin/env node

/**
 * Quick Icon Setup Script
 * Run: node setup-icons.js
 * 
 * This creates placeholder icons so you can build the APK immediately.
 * Replace them later with your custom designs.
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Wallet Manager - Icon Setup\n');

// Create a minimal 1x1 PNG (placeholder)
// This is a valid PNG file with a single green pixel
const createMinimalPNG = () => {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (image header)
  const width = 1024;
  const height = 1024;
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // bit depth
  ihdr.writeUInt8(2, 17); // color type (RGB)
  ihdr.writeUInt8(0, 18); // compression
  ihdr.writeUInt8(0, 19); // filter
  ihdr.writeUInt8(0, 20); // interlace
  
  // Calculate CRC for IHDR
  const crc32 = require('zlib').crc32 || ((buf) => {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  });
  
  const ihdrCrc = crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(ihdrCrc, 21);
  
  // IDAT chunk (image data) - compressed
  const zlib = require('zlib');
  
  // Create image data (all pixels are #376B4B)
  const rawData = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 3 + 1)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const offset = y * (width * 3 + 1) + 1 + x * 3;
      rawData[offset] = 0x37;     // R
      rawData[offset + 1] = 0x6B; // G
      rawData[offset + 2] = 0x4B; // B
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  
  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = crc32(Buffer.concat([idat.slice(4, 8), compressed]));
  idat.writeUInt32BE(idatCrc, 8 + compressed.length);
  
  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
};

try {
  const assetsDir = path.join(__dirname, 'assets');
  
  // Check if assets directory exists
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  console.log('✓ Creating placeholder icons...\n');
  
  // Create placeholder icon
  const iconPath = path.join(assetsDir, 'icon.png');
  if (!fs.existsSync(iconPath)) {
    fs.writeFileSync(iconPath, createMinimalPNG());
    console.log('✓ Created: assets/icon.png (placeholder)');
  } else {
    console.log('✓ Found: assets/icon.png');
  }
  
  // Create placeholder adaptive icon
  const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
  if (!fs.existsSync(adaptiveIconPath)) {
    fs.writeFileSync(adaptiveIconPath, createMinimalPNG());
    console.log('✓ Created: assets/adaptive-icon.png (placeholder)');
  } else {
    console.log('✓ Found: assets/adaptive-icon.png');
  }
  
  // Create placeholder splash
  const splashPath = path.join(assetsDir, 'splash.png');
  if (!fs.existsSync(splashPath)) {
    fs.writeFileSync(splashPath, createMinimalPNG());
    console.log('✓ Created: assets/splash.png (placeholder)');
  } else {
    console.log('✓ Found: assets/splash.png');
  }
  
  console.log('\n✅ Icon setup complete!\n');
  console.log('📝 Next steps:');
  console.log('1. Open assets/icon-generator.html in browser');
  console.log('2. Download custom icons');
  console.log('3. Replace the placeholder files');
  console.log('4. Build APK: eas build --platform android --profile preview\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Alternative: Open assets/icon-generator.html in browser');
}
