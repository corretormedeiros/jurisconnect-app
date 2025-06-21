const financialService = require('../services/financialService');
const { HTTP_STATUS } = require('../utils/constants');

class FinancialController {
  async create(req, res, next) {
    try {
      const result = await financialService.createMovement(req.body);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Movimentação financeira criada com sucesso',
        data: result.movement
      });

    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        tipo: req.query.tipo,
        status: req.query.status,
        data_inicio: req.query.data_inicio,
        data_fim: req.query.data_fim
      };

      const result = await financialService.getAllMovements(filters, page, limit);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Movimentações recuperadas com sucesso',
        data: result.movements,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await financialService.getMovementById(parseInt(id));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Movimentação encontrada',
        data: result.movement
      });

    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await financialService.updateMovement(parseInt(id), req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Movimentação atualizada com sucesso',
        data: result.movement
      });

    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await financialService.deleteMovement(parseInt(id));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const result = await financialService.getFinancialSummary();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Resumo financeiro recuperado com sucesso',
        data: result.summary
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FinancialController();