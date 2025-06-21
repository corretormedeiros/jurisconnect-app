const demandRepository = require('../repositories/demandRepository');
const clientRepository = require('../repositories/clientRepository');
const correspondentRepository = require('../repositories/correspondentRepository');
const loggingService = require('./loggingService');

class DashboardService {
  async getDashboardData() {
    try {
      // Estatísticas das demandas
      const demandStats = await demandRepository.getDemandStats();
      const recentDemands = await demandRepository.getRecentDemands(10);
      const pendingDemands = await demandRepository.getPendingDemands();

      // Estatísticas dos utilizadores
      const totalClients = await clientRepository.count();
      const activeClients = await clientRepository.countActive();
      const totalCorrespondents = await correspondentRepository.count();
      const activeCorrespondents = await correspondentRepository.countActive();

      // Logs recentes
      const recentLogs = await loggingService.getRecentLogs(20);

      return {
        success: true,
        dashboard: {
          demands: {
            total: parseInt(demandStats.total) || 0,
            pendentes: parseInt(demandStats.pendentes) || 0,
            em_andamento: parseInt(demandStats.em_andamento) || 0,
            cumpridas: parseInt(demandStats.cumpridas) || 0,
            canceladas: parseInt(demandStats.canceladas) || 0,
            valor_medio: parseFloat(demandStats.valor_medio) || 0,
            pendentes_sem_correspondente: pendingDemands
          },
          users: {
            clientes: {
              total: totalClients,
              ativos: activeClients,
              inativos: totalClients - activeClients
            },
            correspondentes: {
              total: totalCorrespondents,
              ativos: activeCorrespondents,
              inativos: totalCorrespondents - activeCorrespondents
            }
          },
          recentDemands,
          recentLogs: recentLogs.slice(0, 10),
          summary: {
            total_users: totalClients + totalCorrespondents,
            conversion_rate: totalClients > 0 ? (parseInt(demandStats.total) / totalClients * 100).toFixed(2) + '%' : '0%',
            completion_rate: parseInt(demandStats.total) > 0 ? (parseInt(demandStats.cumpridas) / parseInt(demandStats.total) * 100).toFixed(2) + '%' : '0%'
          }
        }
      };

    } catch (error) {
      console.error('Erro ao gerar dados do dashboard:', error);
      throw error;
    }
  }

  async getMonthlyStats() {
    try {
      // Esta funcionalidade pode ser expandida para mostrar estatísticas mensais
      // Por agora, retorna dados básicos
      return {
        success: true,
        monthlyStats: {
          message: 'Funcionalidade de estatísticas mensais em desenvolvimento'
        }
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();