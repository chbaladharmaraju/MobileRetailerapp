const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analytics.controller');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(auth);

router.get('/', getAnalytics);

module.exports = router;
