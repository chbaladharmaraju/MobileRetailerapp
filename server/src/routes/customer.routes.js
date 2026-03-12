const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, getCustomer, updateCustomer } = require('../controllers/customer.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);

module.exports = router;
