const express = require('express');
const router = express.Router();
const { addDiploma } = require('../controllers/diplomaController');

// POST /api/diplomas
router.post('/', addDiploma);

module.exports = router;
