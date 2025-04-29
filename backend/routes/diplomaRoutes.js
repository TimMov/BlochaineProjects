const express = require('express');
const router = express.Router();
const { addDiploma } = require('../controllers/diplomaController');

// POST /api/diplomas
router.post('/diplomas', addDiploma);

module.exports = router;
