// backend/routes/diplomaRoutes.js

const express = require('express');
const router = express.Router();
const diplomaController = require('../controllers/diplomaController');

// Роут для добавления нового диплома
router.post('/', diplomaController.addDiploma);

// Здесь могут быть и другие роуты, например для получения дипломов

module.exports = router;
