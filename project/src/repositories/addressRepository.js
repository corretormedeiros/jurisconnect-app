const pool = require('../config/database');

class AddressRepository {
  async create(addressData) {
    const {
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep
    } = addressData;

    const query = `
      INSERT INTO enderecos (logradouro, numero, complemento, bairro, cidade, estado, cep)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [logradouro, numero, complemento, bairro, cidade, estado, cep];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM enderecos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async update(id, addressData) {
    const {
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep
    } = addressData;

    const query = `
      UPDATE enderecos 
      SET logradouro = $1, numero = $2, complemento = $3, bairro = $4, 
          cidade = $5, estado = $6, cep = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const values = [logradouro, numero, complemento, bairro, cidade, estado, cep, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM enderecos WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new AddressRepository();