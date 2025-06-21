const pool = require('../config/database');

class ReportRepository {
  async getDemandsByStatus() {
    const query = `
      SELECT 
        status,
        COUNT(*) as quantidade
      FROM demandas
      GROUP BY status
      ORDER BY quantidade DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  async getMonthlyRevenue() {
    const query = `
      SELECT 
        DATE_TRUNC('month', created_at) as mes,
        COUNT(*) as total_diligencias,
        SUM(valor_proposto_cliente) as faturamento
      FROM demandas
      WHERE status = 'Cumprida'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY mes DESC
      LIMIT 12
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  async getNewUsers(startDate, endDate) {
    const query = `
      SELECT 
        'clientes' as tipo,
        COUNT(*) as quantidade
      FROM clientes
      WHERE created_at BETWEEN $1 AND $2
      UNION ALL
      SELECT 
        'correspondentes' as tipo,
        COUNT(*) as quantidade
      FROM correspondentes_servicos
      WHERE created_at BETWEEN $1 AND $2
    `;

    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  async getCorrespondentPerformance() {
    const query = `
      SELECT 
        cs.nome_completo,
        cs.email,
        COUNT(d.id) as total_diligencias,
        COUNT(CASE WHEN d.status = 'Cumprida' THEN 1 END) as diligencias_cumpridas,
        AVG(d.valor_proposto_cliente) as valor_medio
      FROM correspondentes_servicos cs
      LEFT JOIN demandas d ON cs.id = d.correspondente_id
      WHERE cs.is_active = true
      GROUP BY cs.id, cs.nome_completo, cs.email
      ORDER BY total_diligencias DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  async getClientActivity() {
    const query = `
      SELECT 
        c.nome_completo,
        c.email,
        COUNT(d.id) as total_diligencias,
        SUM(d.valor_proposto_cliente) as valor_total,
        MAX(d.created_at) as ultima_diligencia
      FROM clientes c
      LEFT JOIN demandas d ON c.id = d.cliente_id
      WHERE c.is_active = true
      GROUP BY c.id, c.nome_completo, c.email
      ORDER BY total_diligencias DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = new ReportRepository();