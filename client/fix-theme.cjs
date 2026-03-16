const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'pages', 'sales', 'SalesList.jsx'),
  path.join(__dirname, 'src', 'pages', 'repairs', 'RepairsList.jsx'),
  path.join(__dirname, 'src', 'pages', 'secondhand', 'SecondHandList.jsx'),
  path.join(__dirname, 'src', 'pages', 'customers', 'CustomersList.jsx'),
  path.join(__dirname, 'src', 'pages', 'suppliers', 'DistributorsList.jsx'),
  path.join(__dirname, 'src', 'pages', 'invoices', 'InvoicesList.jsx'),
  path.join(__dirname, 'src', 'pages', 'inventory', 'ProductInventory.jsx'),
  path.join(__dirname, 'src', 'pages', 'sales', 'NewSale.jsx'),
  path.join(__dirname, 'src', 'pages', 'repairs', 'RepairIntake.jsx'),
  path.join(__dirname, 'src', 'pages', 'secondhand', 'IntakeForm.jsx'),
  path.join(__dirname, 'src', 'pages', 'secondhand', 'ResaleForm.jsx'),
  path.join(__dirname, 'src', 'pages', 'repairs', 'RepairDetails.jsx')
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  console.log(`Processing ${file}`);
  let content = fs.readFileSync(file, 'utf8');

  // Colors
  content = content.replace(/text-white(?!-)/g, 'text-om-text'); // Avoid text-white-something
  content = content.replace(/bg-white\/5/g, 'bg-om-surface');
  content = content.replace(/bg-white\/10/g, 'bg-om-border');
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-om-surface');
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-om-surface');
  content = content.replace(/bg-white\/\[0\.05\]/g, 'bg-om-surface');
  content = content.replace(/hover:bg-white\/\[0\.05\]/g, 'hover:bg-om-surface');
  content = content.replace(/hover:bg-white\/10/g, 'hover:bg-om-border');
  
  content = content.replace(/border-white\/10/g, 'border-om-border');
  content = content.replace(/border-white\/5/g, 'border-om-border');
  content = content.replace(/border-white\/\[0\.05\]/g, 'border-om-border');
  content = content.replace(/border-white\/\[0\.08\]/g, 'border-om-border');
  content = content.replace(/border-white\/\[0\.04\]/g, 'border-om-border');
  
  content = content.replace(/text-ag-text-muted/g, 'text-om-text-muted');
  content = content.replace(/text-ag-text-dim/g, 'text-om-text-secondary');
  content = content.replace(/text-ag-text/g, 'text-om-text');
  content = content.replace(/text-slate-400/g, 'text-om-text-muted');
  content = content.replace(/text-slate-500/g, 'text-om-text-muted');
  
  content = content.replace(/bg-black\/40/g, 'bg-om-surface');
  content = content.replace(/bg-black\/20/g, 'bg-om-surface');
  content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-om-bg');

  // Fix glass-card specific background issues
  content = content.replace(/glass-card(?! bg-om-card)/g, 'glass-card bg-om-card border border-om-border');

  // Double quotes or single quotes in dynamic styles (if any)
  // For now stick to Tailwind classes

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
});
