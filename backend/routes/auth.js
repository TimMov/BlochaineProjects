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
        message: 'Invalid username or password ' + user.rows[0].password_hash 
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

module.exports = router;