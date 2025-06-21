const reportService = require('../services/reportService');
const { HTTP_STATUS } = require('../utils/constants');

class ReportController {
  async getDemandsByStatus(req, res, next) {
    try {
      const result = await reportService.getDemandsByStatus();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Relatório de demandas por status recuperado com sucesso',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async getMonthlyRevenue(req, res, next) {
    try {
      const result = await reportService.getMonthlyRevenue();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Faturamento mensal recuperado com sucesso',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async getNewUsers(req, res, next) {
    try {
      const startDate = req.query.data_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = req.query.data_fim || new Date().toISOString();

      const result = await reportService.getNewUsers(startDate, endDate);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Relatório de novos usuários recuperado com sucesso',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async getCorrespondentPerformance(req, res, next) {
    try {
      const result = await reportService.getCorrespondentPerformance();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Performance dos correspondentes recuperada com sucesso',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async getClientActivity(req, res, next) {
    try {
      const result = await reportService.getClientActivity();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Atividade dos clientes recuperada com sucesso',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();