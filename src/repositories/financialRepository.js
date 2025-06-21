const pool = require('../config/database');

class FinancialRepository {
  async create(financialData) {
    const {
      descricao,
      valor,
      tipo,
      status,
      data_vencimento,
      data_pagamento,
      diligencia_id,
      cliente_id,
      correspondente_id
    } = financialData;

    const query = `
      INSERT INTO financeiro_movimentacoes 
      (descricao, valor, tipo, status, data_vencimento, data_pagamento, diligencia_id, cliente_id, correspondente_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      descricao, valor, tipo, status, data_vencimento, 
      data_pagamento, diligencia_id, cliente_id, correspondente_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(filters = {}, limit = 50, offset = 0) {
    let query = `
      SELECT f.*, 
             d.titulo as diligencia_titulo,
             c.nome_completo as cliente_nome,
             cs.nome_completo as correspondente_nome
      FROM financeiro_movimentacoes f
      LEFT JOIN demandas d ON f.diligencia_id = d.id
      LEFT JOIN clientes c ON f.cliente_id = c.id
      LEFT JOIN correspondentes_servicos cs ON f.correspondente_id = cs.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (filters.tipo) {
      query += ` AND f.tipo = $${paramCount}`;
      values.push(filters.tipo);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND f.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.data_inicio) {
      query += ` AND f.created_at >= $${paramCount}`;
      values.push(filters.data_inicio);
      paramCount++;
    }

    if (filters.data_fim) {
      query += ` AND f.created_at <= $${paramCount}`;
      values.push(filters.data_fim);
      paramCount++;
    }

    query += ` ORDER BY f.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT f.*, 
             d.titulo as diligencia_titulo,
             c.nome_completo as cliente_nome,
             cs.nome_completo as correspondente_nome
      FROM financeiro_movimentacoes f
      LEFT JOIN demandas d ON f.diligencia_id = d.id
      LEFT JOIN clientes c ON f.cliente_id = c.id
      LEFT JOIN correspondentes_servicos cs ON f.correspondente_id = cs.id
      WHERE f.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async update(id, financialData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(financialData).forEach(key => {
      if (financialData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(financialData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE financeiro_movimentacoes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM financeiro_movimentacoes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async getFinancialSummary() {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE 0 END), 0) as total_entradas,
        COALESCE(SUM(CASE WHEN tipo = 'SAIDA' THEN valor ELSE 0 END), 0) as total_saidas,
        COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE -valor END), 0) as lucro,
        COALESCE(SUM(CASE WHEN status = 'A_PAGAR' THEN valor ELSE 0 END), 0) as total_a_pagar,
        COALESCE(SUM(CASE WHEN status = 'A_RECEBER' THEN valor ELSE 0 END), 0) as total_a_receber
      FROM financeiro_movimentacoes
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM financeiro_movimentacoes WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.tipo) {
      query += ` AND tipo = $${paramCount}`;
      values.push(filters.tipo);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }
}

module.exports = new FinancialRepository();