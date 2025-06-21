const pool = require('../config/database');

class CorrespondentRepository {
  async create(correspondentData, addressId) {
    const {
      nome_completo,
      tipo,
      oab,
      rg,
      cpf,
      email,
      telefone,
      comarcas_atendidas,
      senha_hash
    } = correspondentData;

    const query = `
      INSERT INTO correspondentes_servicos 
      (nome_completo, tipo, oab, rg, cpf, email, telefone, endereco_id, comarcas_atendidas, senha_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, nome_completo, tipo, oab, rg, cpf, email, telefone, endereco_id, comarcas_atendidas, is_active, created_at, updated_at
    `;

    const values = [
      nome_completo, tipo, oab, rg, cpf, email, telefone, 
      addressId, comarcas_atendidas, senha_hash
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT cs.*, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep
      FROM correspondentes_servicos cs
      LEFT JOIN enderecos e ON cs.endereco_id = e.id
      ORDER BY cs.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT cs.*, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep
      FROM correspondentes_servicos cs
      LEFT JOIN enderecos e ON cs.endereco_id = e.id
      WHERE cs.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM correspondentes_servicos WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async findByCpf(cpf) {
    const query = 'SELECT * FROM correspondentes_servicos WHERE cpf = $1';
    const result = await pool.query(query, [cpf]);
    return result.rows[0];
  }

  async findByOab(oab) {
    const query = 'SELECT * FROM correspondentes_servicos WHERE oab = $1';
    const result = await pool.query(query, [oab]);
    return result.rows[0];
  }

  async update(id, correspondentData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(correspondentData).forEach(key => {
      if (correspondentData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(correspondentData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE correspondentes_servicos 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nome_completo, tipo, oab, rg, cpf, email, telefone, endereco_id, comarcas_atendidas, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateStatus(id, isActive) {
    const query = `
      UPDATE correspondentes_servicos 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, nome_completo, email, is_active
    `;

    const result = await pool.query(query, [isActive, id]);
    return result.rows[0];
  }

  async count() {
    const query = 'SELECT COUNT(*) as total FROM correspondentes_servicos';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  async countActive() {
    const query = 'SELECT COUNT(*) as total FROM correspondentes_servicos WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  async findAvailableForDemand(comarcas) {
    const query = `
      SELECT id, nome_completo, tipo, comarcas_atendidas, email
      FROM correspondentes_servicos 
      WHERE is_active = true 
      AND (comarcas_atendidas ILIKE ANY($1))
      ORDER BY created_at ASC
    `;

    const comarcaPatterns = comarcas.map(comarca => `%${comarca}%`);
    const result = await pool.query(query, [comarcaPatterns]);
    return result.rows;
  }
}

module.exports = new CorrespondentRepository();