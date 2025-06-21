const activityLogRepository = require('../repositories/activityLogRepository');
const { LOG_TYPES } = require('../utils/constants');

class LoggingService {
  async logDemandCreation(demandId, actorId, actorProfile, demandTitle) {
    try {
      await activityLogRepository.create({
        demanda_id: demandId,
        ator_id: actorId,
        ator_perfil: actorProfile,
        tipo_log: LOG_TYPES.CREATION,
        detalhes: {
          action: 'demand_created',
          demand_title: demandTitle,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registar log de criação de demanda:', error);
    }
  }

  async logStatusChange(demandId, actorId, actorProfile, oldStatus, newStatus) {
    try {
      await activityLogRepository.create({
        demanda_id: demandId,
        ator_id: actorId,
        ator_perfil: actorProfile,
        tipo_log: LOG_TYPES.STATUS_CHANGE,
        detalhes: {
          action: 'status_changed',
          old_status: oldStatus,
          new_status: newStatus,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registar log de mudança de status:', error);
    }
  }

  async logAssignment(demandId, actorId, actorProfile, correspondentId, correspondentName) {
    try {
      await activityLogRepository.create({
        demanda_id: demandId,
        ator_id: actorId,
        ator_perfil: actorProfile,
        tipo_log: LOG_TYPES.UPDATE,
        detalhes: {
          action: 'correspondent_assigned',
          correspondent_id: correspondentId,
          correspondent_name: correspondentName,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registar log de atribuição:', error);
    }
  }

  async logFileUpload(demandId, actorId, actorProfile, fileName, fileSize) {
    try {
      await activityLogRepository.create({
        demanda_id: demandId,
        ator_id: actorId,
        ator_perfil: actorProfile,
        tipo_log: LOG_TYPES.FILE_UPLOAD,
        detalhes: {
          action: 'file_uploaded',
          file_name: fileName,
          file_size: fileSize,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registar log de upload de arquivo:', error);
    }
  }

  async logDemandUpdate(demandId, actorId, actorProfile, updatedFields) {
    try {
      await activityLogRepository.create({
        demanda_id: demandId,
        ator_id: actorId,
        ator_perfil: actorProfile,
        tipo_log: LOG_TYPES.UPDATE,
        detalhes: {
          action: 'demand_updated',
          updated_fields: updatedFields,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registar log de atualização de demanda:', error);
    }
  }

  async getDemandLogs(demandId, limit = 50, offset = 0) {
    try {
      return await activityLogRepository.findByDemandId(demandId, limit, offset);
    } catch (error) {
      console.error('Erro ao buscar logs da demanda:', error);
      throw error;
    }
  }

  async getRecentLogs(limit = 100) {
    try {
      return await activityLogRepository.findRecent(limit);
    } catch (error) {
      console.error('Erro ao buscar logs recentes:', error);
      throw error;
    }
  }
}

module.exports = new LoggingService();