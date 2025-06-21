const pool = require('../config/database');

class ActivityLogRepository {
  async create(logData) {
    const {
      demanda_id,
      ator_id,
      ator_perfil,
      tipo_log,
      detalhes
    } = logData;

    const query = `
      INSERT INTO log_atividades (demanda_id, ator_id, ator_perfil, tipo_log, detalhes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [demanda_id, ator_id, ator_perfil, tipo_log, JSON.stringify(detalhes)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByDemandId(demandId, limit = 50, offset = 0) {
    const query = `
      SELECT l.*,
             CASE 
               WHEN l.ator_perfil = 'cliente' THEN c.nome_completo
               WHEN l.ator_perfil = 'correspondente' THEN cs.nome_completo
               WHEN l.ator_perfil = 'admin' THEN a.nome
             END as ator_nome
      FROM log_atividades l
      LEFT JOIN clientes c ON l.ator_id = c.id AND l.ator_perfil = 'cliente'
      LEFT JOIN correspondentes_servicos cs ON l.ator_id = cs.id AND l.ator_perfil = 'correspondente'
      LEFT JOIN admins a ON l.ator_id = a.id AND l.ator_perfil = 'admin'
      WHERE l.demanda_id = $1
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [demandId, limit, offset]);
    return result.rows;
  }

  async findRecent(limit = 100) {
    const query = `
      SELECT l.*,
             d.titulo as demanda_titulo,
             CASE 
               WHEN l.ator_perfil = 'cliente' THEN c.nome_completo
               WHEN l.ator_perfil = 'correspondente' THEN cs.nome_completo
               WHEN l.ator_perfil = 'admin' THEN a.nome
             END as ator_nome
      FROM log_atividades l
      LEFT JOIN demandas d ON l.demanda_id = d.id
      LEFT JOIN clientes c ON l.ator_id = c.id AND l.ator_perfil = 'cliente'
      LEFT JOIN correspondentes_servicos cs ON l.ator_id = cs.id AND l.ator_perfil = 'correspondente'
      LEFT JOIN admins a ON l.ator_id = a.id AND l.ator_perfil = 'admin'
      ORDER BY l.created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = new ActivityLogRepository();