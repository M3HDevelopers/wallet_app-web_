// Icon Generator - Creates app icon programmatically
// Install dependencies first: npm install canvas
// Then run: node create-icon.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create 1024x1024 canvas
const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#F7F7F3';
ctx.fillRect(0, 0, 1024, 1024);

// Center the icon
ctx.translate(512, 512);

// Wallet body
ctx.strokeStyle = '#376B4B';
ctx.lineWidth = 24;
ctx.strokeRect(-180, -120, 360, 240);

// Wallet flap
ctx.beginPath();
ctx.moveTo(-180, -120);
ctx.lineTo(-180, -160);
ctx.quadraticCurveTo(-180, -180, -160, -180);
ctx.lineTo(160, -180);
ctx.quadraticCurveTo(180, -180, 180, -160);
ctx.lineTo(180, -120);
ctx.stroke();

// Card slot
ctx.fillStyle = 'rgba(55, 107, 75, 0.15)';
ctx.fillRect(-140, -60, 280, 80);

// Rs text
ctx.fillStyle = '#376B4B';
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Rs', 0, 20);

// Decorative lines
ctx.strokeStyle = 'rgba(55, 107, 75, 0.3)';
ctx.lineWidth = 8;
ctx.beginPath();
ctx.moveTo(-140, 60);
ctx.lineTo(140, 60);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(-140, 90);
ctx.lineTo(100, 90);
ctx.stroke();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.png'), buffer);
fs.writeFileSync(path.join(__dirname, 'assets', 'adaptive-icon.png'), buffer);

console.log('✓ Icon created: assets/icon.png');
console.log('✓ Adaptive icon created: assets/adaptive-icon.png');
console.log('');
console.log('To install canvas: npm install canvas');
console.log('Then run: node create-icon.js');
