const express = require('express');
const router = express.Router();
const { createRepair, getRepairs, getRepair, updateRepair, addRepairPart } = require('../controllers/repair.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', createRepair);
router.get('/', getRepairs);
router.get('/:id', getRepair);
router.put('/:id', updateRepair);
router.post('/:id/parts', addRepairPart);

module.exports = router;
