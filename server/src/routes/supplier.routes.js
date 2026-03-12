const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const {
  getDistributors,
  getDistributorById,
  createDistributor,
  recordInventoryPurchase,
  recordPaymentToDistributor
} = require('../controllers/supplier.controller');

const router = express.Router();

router.use(auth); // Require login for all supplier routes
const requireAuthRoles = roleGuard('ADMIN', 'STAFF');

router.get('/', requireAuthRoles, getDistributors);
router.get('/:id', requireAuthRoles, getDistributorById);
router.post('/', requireAuthRoles, createDistributor);
router.post('/intake', requireAuthRoles, recordInventoryPurchase);
router.post('/:id/payment', requireAuthRoles, recordPaymentToDistributor);

module.exports = router;
