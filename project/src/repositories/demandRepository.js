const pool = require('../config/database');

class DemandRepository {
  async create(demandData) {
    const {
      titulo,
      descricao_completa,
      numero_processo,
      tipo_demanda,
      prazo_fatal,
      valor_proposto_cliente,
      cliente_id
    } = demandData;

    const query = `
      INSERT INTO demandas 
      (titulo, descricao_completa, numero_processo, tipo_demanda, prazo_fatal, valor_proposto_cliente, cliente_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      titulo, descricao_completa, numero_processo, tipo_demanda, 
      prazo_fatal, valor_proposto_cliente, cliente_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(id) {
    const query = `
      SELECT d.*, 
             c.nome_completo as cliente_nome, c.email as cliente_email,
             cs.nome_completo as correspondente_nome, cs.email as correspondente_email,
             a.nome as admin_nome
      FROM demandas d
      LEFT JOIN clientes c ON d.cliente_id = c.id
      LEFT JOIN correspondentes_servicos cs ON d.correspondente_id = cs.id
      LEFT JOIN admins a ON d.admin_responsavel_id = a.id
      WHERE d.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async findByClientId(clientId, limit = 50, offset = 0) {
    const query = `
      SELECT d.*, 
             c.nome_completo as cliente_nome,
             cs.nome_completo as correspondente_nome,
             a.nome as admin_nome
      FROM demandas d
      LEFT JOIN clientes c ON d.cliente_id = c.id
      LEFT JOIN correspondentes_servicos cs ON d.correspondente_id = cs.id
      LEFT JOIN admins a ON d.admin_responsavel_id = a.id
      WHERE d.cliente_id = $1
      ORDER BY d.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [clientId, limit, offset]);
    return result.rows;
  }

  async findByCorrespondentId(correspondentId, limit = 50, offset = 0) {
    const query = `
      SELECT d.*, 
             c.nome_completo as cliente_nome,
             cs.nome_completo as correspondente_nome,
             a.nome as admin_nome
      FROM demandas d
      LEFT JOIN clientes c ON d.cliente_id = c.id
      LEFT JOIN correspondentes_servicos cs ON d.correspondente_id = cs.id
      LEFT JOIN admins a ON d.admin_responsavel_id = a.id
      WHERE d.correspondente_id = $1
      ORDER BY d.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [correspondentId, limit, offset]);
    return result.rows;
  }

  async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT d.*, 
             c.nome_completo as cliente_nome,
             cs.nome_completo as correspondente_nome,
             a.nome as admin_nome
      FROM demandas d
      LEFT JOIN clientes c ON d.cliente_id = c.id
      LEFT JOIN correspondentes_servicos cs ON d.correspondente_id = cs.id
      LEFT JOIN admins a ON d.admin_responsavel_id = a.id
      ORDER BY d.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async assignCorrespondent(demandId, correspondentId, adminId) {
    const query = `
      UPDATE demandas 
      SET correspondente_id = $1, admin_responsavel_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [correspondentId, adminId, demandId]);
    return result.rows[0];
  }

  async updateStatus(demandId, status) {
    const query = `
      UPDATE demandas 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, demandId]);
    return result.rows[0];
  }

  async update(id, demandData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(demandData).forEach(key => {
      if (demandData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(demandData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE demandas 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Métrica para dashboard
  async getDemandStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'Em Andamento' THEN 1 END) as em_andamento,
        COUNT(CASE WHEN status = 'Cumprida' THEN 1 END) as cumpridas,
        COUNT(CASE WHEN status = 'Cancelada' THEN 1 END) as canceladas,
        AVG(valor_proposto_cliente) as valor_medio
      FROM demandas
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  async getRecentDemands(limit = 10) {
    const query = `
      SELECT d.id, d.titulo, d.status, d.created_at,
             c.nome_completo as cliente_nome
      FROM demandas d
      LEFT JOIN clientes c ON d.cliente_id = c.id
      ORDER BY d.created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async getPendingDemands() {
    const query = `
      SELECT COUNT(*) as total
      FROM demandas 
      WHERE status = 'Pendente' AND correspondente_id IS NULL
    `;

    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }
}

module.exports = new DemandRepository();