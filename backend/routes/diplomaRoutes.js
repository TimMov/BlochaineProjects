const express = require('express');
const router = express.Router();
const diplomaController = require('../controllers/diplomaController');

// POST /api/diplomas
router.post('/', diplomaController.addDiploma);

module.exports = router;
