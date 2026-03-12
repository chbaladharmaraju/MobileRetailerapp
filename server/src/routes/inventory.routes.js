const express = require('express');
const router = express.Router();
const {
  createProduct, getProducts, getProduct, updateProduct, deleteProduct,
  createSparePart, getSpareParts, updateSparePart,
  getAlerts, markAlertRead,
} = require('../controllers/inventory.controller');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(auth);

// Products
router.post('/products', roleGuard('ADMIN', 'STAFF'), createProduct);
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.put('/products/:id', roleGuard('ADMIN', 'STAFF'), updateProduct);
router.delete('/products/:id', roleGuard('ADMIN', 'STAFF'), deleteProduct);

// Spare Parts
router.post('/parts', roleGuard('ADMIN', 'STAFF'), createSparePart);
router.get('/parts', getSpareParts);
router.put('/parts/:id', roleGuard('ADMIN', 'STAFF'), updateSparePart);

// Alerts
router.get('/alerts', getAlerts);
router.put('/alerts/:id/read', markAlertRead);

module.exports = router;
