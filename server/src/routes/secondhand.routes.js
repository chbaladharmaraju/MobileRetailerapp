const express = require('express');
const router = express.Router();
const { createIntake, getIntakes, getIntake, createResale } = require('../controllers/secondhand.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/intake', createIntake);
router.get('/intake', getIntakes);
router.get('/intake/:id', getIntake);
router.post('/resale', createResale);

module.exports = router;
