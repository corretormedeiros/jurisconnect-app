const pool = require('../config/database');

class AdminRepository {
  async create(adminData) {
    const { nome, email, senha_hash } = adminData;

    const query = `
      INSERT INTO admins (nome, email, senha_hash)
      VALUES ($1, $2, $3)
      RETURNING id, nome, email, is_active, created_at
    `;

    const values = [nome, email, senha_hash];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM admins WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT id, nome, email, is_active, last_login, created_at FROM admins WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async updateLastLogin(id) {
    const query = `
      UPDATE admins 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING id, nome, email, last_login
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async findAll() {
    const query = `
      SELECT id, nome, email, is_active, last_login, created_at 
      FROM admins 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = new AdminRepository();