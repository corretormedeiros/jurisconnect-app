const dashboardService = require('../services/dashboardService');
const { HTTP_STATUS } = require('../utils/constants');

class DashboardController {
  async getDashboardData(req, res, next) {
    try {
      const result = await dashboardService.getDashboardData();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Dados do dashboard recuperados com sucesso',
        data: result.dashboard
      });

    } catch (error) {
      next(error);
    }
  }

  async getMonthlyStats(req, res, next) {
    try {
      const result = await dashboardService.getMonthlyStats();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Estatísticas mensais recuperadas com sucesso',
        data: result.monthlyStats
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();