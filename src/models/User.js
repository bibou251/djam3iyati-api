const pool = require('../config/db');

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      phone VARCHAR(10) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      trust_score DECIMAL(3,2) DEFAULT 5.00,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
};

createTable();

const findByPhone = async (phone) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
  return rows[0];
};

const create = async (phone, passwordHash, fullName) => {
  const { rows } = await pool.query(
    'INSERT INTO users (phone, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, phone, full_name, trust_score, created_at',
    [phone, passwordHash, fullName]
  );
  return rows[0];
};

module.exports = { findByPhone, create };
