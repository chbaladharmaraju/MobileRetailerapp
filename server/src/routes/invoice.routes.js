const express = require('express');
const router = express.Router();
const {
  createSaleInvoice, createSecondHandInvoice, createRepairInvoice,
  getInvoices, getInvoice, getInvoicePDF,
} = require('../controllers/invoice.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/sale', createSaleInvoice);
router.post('/secondhand', createSecondHandInvoice);
router.post('/repair', createRepairInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.get('/:id/pdf', getInvoicePDF);

module.exports = router;
