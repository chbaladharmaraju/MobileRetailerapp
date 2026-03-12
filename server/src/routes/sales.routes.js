const express = require('express');
const router = express.Router();
const { createSale, getSales, getSale } = require('../controllers/sales.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSale);

module.exports = router;
