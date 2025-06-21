const pool = require('../config/database');

class ClientRepository {
  async create(clientData, addressId) {
    const {
      nome_completo,
      escritorio,
      telefone,
      email,
      senha_hash
    } = clientData;

    const query = `
      INSERT INTO clientes (nome_completo, escritorio, telefone, email, senha_hash, endereco_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome_completo, escritorio, telefone, email, endereco_id, is_active, created_at, updated_at
    `;

    const values = [nome_completo, escritorio, telefone, email, senha_hash, addressId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT c.*, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep
      FROM clientes c
      LEFT JOIN enderecos e ON c.endereco_id = e.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT c.*, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep
      FROM clientes c
      LEFT JOIN enderecos e ON c.endereco_id = e.id
      WHERE c.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM clientes WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async update(id, clientData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(clientData).forEach(key => {
      if (clientData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(clientData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE clientes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nome_completo, escritorio, telefone, email, endereco_id, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateStatus(id, isActive) {
    const query = `
      UPDATE clientes 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, nome_completo, email, is_active
    `;

    const result = await pool.query(query, [isActive, id]);
    return result.rows[0];
  }

  async count() {
    const query = 'SELECT COUNT(*) as total FROM clientes';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  async countActive() {
    const query = 'SELECT COUNT(*) as total FROM clientes WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }
}

module.exports = new ClientRepository();