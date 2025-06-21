const pool = require('../config/database');

class AttachmentRepository {
  async create(attachmentData) {
    const {
      demanda_id,
      uploader_id,
      uploader_perfil,
      nome_original,
      path_armazenamento,
      tipo_mime,
      tamanho_bytes
    } = attachmentData;

    const query = `
      INSERT INTO anexos_demandas 
      (demanda_id, uploader_id, uploader_perfil, nome_original, path_armazenamento, tipo_mime, tamanho_bytes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      demanda_id, uploader_id, uploader_perfil, 
      nome_original, path_armazenamento, tipo_mime, tamanho_bytes
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByDemandId(demandId) {
    const query = `
      SELECT a.*, 
             CASE 
               WHEN a.uploader_perfil = 'cliente' THEN c.nome_completo
               WHEN a.uploader_perfil = 'correspondente' THEN cs.nome_completo
               WHEN a.uploader_perfil = 'admin' THEN ad.nome
             END as uploader_nome
      FROM anexos_demandas a
      LEFT JOIN clientes c ON a.uploader_id = c.id AND a.uploader_perfil = 'cliente'
      LEFT JOIN correspondentes_servicos cs ON a.uploader_id = cs.id AND a.uploader_perfil = 'correspondente'
      LEFT JOIN admins ad ON a.uploader_id = ad.id AND a.uploader_perfil = 'admin'
      WHERE a.demanda_id = $1
      ORDER BY a.created_at DESC
    `;

    const result = await pool.query(query, [demandId]);
    return result.rows;
  }

  async findById(id) {
    const query = 'SELECT * FROM anexos_demandas WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM anexos_demandas WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async countByDemandId(demandId) {
    const query = 'SELECT COUNT(*) as total FROM anexos_demandas WHERE demanda_id = $1';
    const result = await pool.query(query, [demandId]);
    return parseInt(result.rows[0].total);
  }
}

module.exports = new AttachmentRepository();