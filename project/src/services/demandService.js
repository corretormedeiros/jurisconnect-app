const demandRepository = require('../repositories/demandRepository');
const correspondentRepository = require('../repositories/correspondentRepository');
const loggingService = require('./loggingService');
const { HTTP_STATUS, USER_PROFILES, DEMAND_STATUS } = require('../utils/constants');

class DemandService {
  async createDemand(demandData, clientId) {
    try {
      const demand = await demandRepository.create({
        ...demandData,
        cliente_id: clientId
      });

      // Log da criação
      await loggingService.logDemandCreation(
        demand.id, 
        clientId, 
        USER_PROFILES.CLIENT, 
        demand.titulo
      );

      return {
        success: true,
        demand
      };

    } catch (error) {
      console.error('Erro ao criar demanda:', error);
      throw error;
    }
  }

  async getDemandById(id, userId, userProfile) {
    try {
      const demand = await demandRepository.findById(id);
      
      if (!demand) {
        const error = new Error('Demanda não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Verificar permissões
      if (userProfile !== USER_PROFILES.ADMIN) {
        if (userProfile === USER_PROFILES.CLIENT && demand.cliente_id !== userId) {
          const error = new Error('Acesso negado a esta demanda');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }

        if (userProfile === USER_PROFILES.CORRESPONDENT && demand.correspondente_id !== userId) {
          const error = new Error('Acesso negado a esta demanda');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      return {
        success: true,
        demand
      };

    } catch (error) {
      console.error('Erro ao buscar demanda:', error);
      throw error;
    }
  }

  async getMyDemands(userId, userProfile, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      let demands;

      switch (userProfile) {
        case USER_PROFILES.CLIENT:
          demands = await demandRepository.findByClientId(userId, limit, offset);
          break;
        case USER_PROFILES.CORRESPONDENT:
          demands = await demandRepository.findByCorrespondentId(userId, limit, offset);
          break;
        case USER_PROFILES.ADMIN:
          demands = await demandRepository.findAll(limit, offset);
          break;
        default:
          demands = [];
      }

      return {
        success: true,
        demands,
        pagination: {
          page,
          limit,
          hasMore: demands.length === limit
        }
      };

    } catch (error) {
      console.error('Erro ao buscar minhas demandas:', error);
      throw error;
    }
  }

  async assignDemand(demandId, correspondentId, adminId) {
    try {
      const demand = await demandRepository.findById(demandId);
      if (!demand) {
        const error = new Error('Demanda não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      const correspondent = await correspondentRepository.findById(correspondentId);
      if (!correspondent || !correspondent.is_active) {
        const error = new Error('Correspondente não encontrado ou inativo');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      const updatedDemand = await demandRepository.assignCorrespondent(demandId, correspondentId, adminId);

      // Log da atribuição
      await loggingService.logAssignment(
        demandId,
        adminId,
        USER_PROFILES.ADMIN,
        correspondentId,
        correspondent.nome_completo
      );

      return {
        success: true,
        demand: updatedDemand
      };

    } catch (error) {
      console.error('Erro ao atribuir demanda:', error);
      throw error;
    }
  }

  async updateDemandStatus(demandId, newStatus, userId, userProfile) {
    try {
      const demand = await demandRepository.findById(demandId);
      if (!demand) {
        const error = new Error('Demanda não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Verificar permissões
      if (userProfile === USER_PROFILES.CORRESPONDENT && demand.correspondente_id !== userId) {
        const error = new Error('Apenas o correspondente responsável pode alterar o status');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      if (userProfile === USER_PROFILES.CLIENT) {
        const error = new Error('Clientes não podem alterar o status das demandas');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const oldStatus = demand.status;
      const updatedDemand = await demandRepository.updateStatus(demandId, newStatus);

      // Log da mudança de status
      await loggingService.logStatusChange(
        demandId,
        userId,
        userProfile,
        oldStatus,
        newStatus
      );

      return {
        success: true,
        demand: updatedDemand
      };

    } catch (error) {
      console.error('Erro ao atualizar status da demanda:', error);
      throw error;
    }
  }

  async updateDemand(demandId, updateData, userId, userProfile) {
    try {
      const demand = await demandRepository.findById(demandId);
      if (!demand) {
        const error = new Error('Demanda não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Verificar permissões
      if (userProfile === USER_PROFILES.CLIENT && demand.cliente_id !== userId) {
        const error = new Error('Acesso negado para editar esta demanda');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      if (userProfile === USER_PROFILES.CORRESPONDENT && demand.correspondente_id !== userId) {
        const error = new Error('Acesso negado para editar esta demanda');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const updatedDemand = await demandRepository.update(demandId, updateData);

      // Log da atualização
      await loggingService.logDemandUpdate(
        demandId,
        userId,
        userProfile,
        Object.keys(updateData)
      );

      return {
        success: true,
        demand: updatedDemand
      };

    } catch (error) {
      console.error('Erro ao atualizar demanda:', error);
      throw error;
    }
  }

  async getDemandStats() {
    try {
      const stats = await demandRepository.getDemandStats();
      const recentDemands = await demandRepository.getRecentDemands(10);
      const pendingCount = await demandRepository.getPendingDemands();

      return {
        success: true,
        stats: {
          total: parseInt(stats.total) || 0,
          pendentes: parseInt(stats.pendentes) || 0,
          em_andamento: parseInt(stats.em_andamento) || 0,
          cumpridas: parseInt(stats.cumpridas) || 0,
          canceladas: parseInt(stats.canceladas) || 0,
          valor_medio: parseFloat(stats.valor_medio) || 0,
          pendentes_sem_correspondente: pendingCount
        },
        recentDemands
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas das demandas:', error);
      throw error;
    }
  }
}

module.exports = new DemandService();