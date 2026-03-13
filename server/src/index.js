const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const salesRoutes = require('./routes/sales.routes');
const secondhandRoutes = require('./routes/secondhand.routes');
const repairRoutes = require('./routes/repair.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const creditRoutes = require('./routes/credit.routes');
const supplierRoutes = require('./routes/supplier.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://orangemobileretailapp.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(ao => origin === ao) || 
                     origin.endsWith('.vercel.app') || 
                     origin.includes('localhost');
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'Orange Mobile Retail API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/secondhand', secondhandRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/distributors', supplierRoutes); // Alias for compatibility
app.use('/api/uploads', uploadRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Orange Mobile Retail API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
