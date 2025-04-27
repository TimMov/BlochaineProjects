const bcrypt = require('bcryptjs');
const pool = require('../db');

router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await pool.query(
      `INSERT INTO users 
       (username, password_hash, password_visible, salt, role, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [username, passwordHash, password, salt, role || 'user']
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(
      password, 
      user.rows[0].password_hash
    );
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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
    res.status(500).json({ error: 'Server error' });
  }
});