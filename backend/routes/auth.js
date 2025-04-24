const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

// Эндпоинт для входа
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Находим пользователя
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // 2. Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // 3. Возвращаем успешный ответ
    res.json({ 
      success: true,
      role: user.rows[0].role 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;