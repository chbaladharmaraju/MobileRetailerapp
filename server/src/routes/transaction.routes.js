const express = require('express');
const router = express.Router();
const { getAllTransactions } = require('../controllers/transaction.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/all', getAllTransactions);

module.exports = router;
