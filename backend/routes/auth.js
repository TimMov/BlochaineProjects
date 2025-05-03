const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

// Логин пользователя
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Находим пользователя
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password' 
      });
    }

    // 2. Проверяем пароль
    const validPassword = await bcrypt.compare(
      password, 
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password'
      });
    }

    // 3. Успешный ответ
    res.json({ 
      success: true,
      user: {
        id: user.rows[0].user_id,
        username: user.rows[0].username,
        role: user.rows[0].role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
});

// Регистрация пользователя
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  // 1. Проверяем, существует ли пользователь с таким же логином
  const existingUser = await pool.query(
    'SELECT * FROM users WHERE username = $1', 
    [username]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Username already exists'
    });
  }

  // 2. Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Сохраняем нового пользователя в базе данных
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *', 
      [username, hashedPassword, role || 'user'] // Default role 'user'
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.user_id,
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

module.exports = router;
