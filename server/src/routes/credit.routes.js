const express = require('express');
const router = express.Router();
const { recordPayment, getCustomerLedger, getCreditCustomers } = require('../controllers/credit.controller');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(auth);

// Provide a list of customers who owe money
router.get('/customers', getCreditCustomers);

// Provide the ledger of a specific customer
router.get('/:customerId', getCustomerLedger);

// Record a payment over credit
router.post('/payment', roleGuard('ADMIN', 'STAFF'), recordPayment);

module.exports = router;
