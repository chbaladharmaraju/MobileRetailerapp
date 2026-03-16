const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'pages', 'repairs', 'RepairDetails.jsx'),
  path.join(__dirname, 'src', 'pages', 'secondhand', 'ResaleForm.jsx')
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Colors
  content = content.replace(/text-white/g, 'text-om-text');
  content = content.replace(/bg-white\/5/g, 'bg-om-surface');
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-om-surface');
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-om-surface');
  content = content.replace(/bg-white\/10/g, 'bg-om-border'); // usually hover or borders
  content = content.replace(/border-white\/10/g, 'border-om-border');
  content = content.replace(/border-white\/5/g, 'border-om-border');
  content = content.replace(/border-white\/\[0\.08\]/g, 'border-om-border');
  content = content.replace(/bg-black\/40/g, 'bg-om-surface');
  content = content.replace(/bg-black\/20/g, 'bg-om-surface');
  content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-om-bg');
  
  // Legacy AG classes
  content = content.replace(/text-ag-text-muted/g, 'text-om-text-muted');
  content = content.replace(/text-ag-text-dim/g, 'text-om-text-secondary');
  content = content.replace(/text-ag-text/g, 'text-om-text');

  // Fix borders
  content = content.replace(/border border-white\/\[0\.08\]/g, 'border border-om-border');
  
  // Make sure glass-card has surface
  content = content.replace(/glass-card(?! bg-om-card)/g, 'glass-card bg-om-card border-om-border');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
});
