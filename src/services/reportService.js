const reportRepository = require('../repositories/reportRepository');

class ReportService {
  async getDemandsByStatus() {
    try {
      const data = await reportRepository.getDemandsByStatus();

      return {
        success: true,
        data: data.map(item => ({
          status: item.status,
          quantidade: parseInt(item.quantidade)
        }))
      };

    } catch (error) {
      console.error('Erro ao buscar relatório de demandas por status:', error);
      throw error;
    }
  }

  async getMonthlyRevenue() {
    try {
      const data = await reportRepository.getMonthlyRevenue();

      return {
        success: true,
        data: data.map(item => ({
          mes: item.mes,
          total_diligencias: parseInt(item.total_diligencias),
          faturamento: parseFloat(item.faturamento) || 0
        }))
      };

    } catch (error) {
      console.error('Erro ao buscar faturamento mensal:', error);
      throw error;
    }
  }

  async getNewUsers(startDate, endDate) {
    try {
      const data = await reportRepository.getNewUsers(startDate, endDate);

      return {
        success: true,
        data: data.map(item => ({
          tipo: item.tipo,
          quantidade: parseInt(item.quantidade)
        }))
      };

    } catch (error) {
      console.error('Erro ao buscar novos usuários:', error);
      throw error;
    }
  }

  async getCorrespondentPerformance() {
    try {
      const data = await reportRepository.getCorrespondentPerformance();

      return {
        success: true,
        data: data.map(item => ({
          nome_completo: item.nome_completo,
          email: item.email,
          total_diligencias: parseInt(item.total_diligencias) || 0,
          diligencias_cumpridas: parseInt(item.diligencias_cumpridas) || 0,
          valor_medio: parseFloat(item.valor_medio) || 0,
          taxa_sucesso: item.total_diligencias > 0 
            ? ((item.diligencias_cumpridas / item.total_diligencias) * 100).toFixed(2) + '%'
            : '0%'
        }))
      };

    } catch (error) {
      console.error('Erro ao buscar performance dos correspondentes:', error);
      throw error;
    }
  }

  async getClientActivity() {
    try {
      const data = await reportRepository.getClientActivity();

      return {
        success: true,
        data: data.map(item => ({
          nome_completo: item.nome_completo,
          email: item.email,
          total_diligencias: parseInt(item.total_diligencias) || 0,
          valor_total: parseFloat(item.valor_total) || 0,
          ultima_diligencia: item.ultima_diligencia
        }))
      };

    } catch (error) {
      console.error('Erro ao buscar atividade dos clientes:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();