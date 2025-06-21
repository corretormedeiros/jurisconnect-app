const demandService = require('../services/demandService');
const { HTTP_STATUS } = require('../utils/constants');

class DemandController {
  async create(req, res, next) {
    try {
      const result = await demandService.createDemand(req.body, req.user.id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Demanda criada com sucesso',
        data: result.demand
      });

    } catch (error) {
      next(error);
    }
  }

  async getMyDemands(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await demandService.getMyDemands(
        req.user.id, 
        req.user.profile, 
        page, 
        limit
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Demandas recuperadas com sucesso',
        data: result.demands,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await demandService.getDemandById(
        parseInt(id), 
        req.user.id, 
        req.user.profile
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Demanda encontrada',
        data: result.demand
      });

    } catch (error) {
      next(error);
    }
  }

  async assignCorrespondent(req, res, next) {
    try {
      const { id } = req.params;
      const { correspondente_id } = req.body;

      const result = await demandService.assignDemand(
        parseInt(id), 
        correspondente_id, 
        req.user.id
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Correspondente atribuído com sucesso',
        data: result.demand
      });

    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await demandService.updateDemandStatus(
        parseInt(id), 
        status, 
        req.user.id, 
        req.user.profile
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Status da demanda atualizado com sucesso',
        data: result.demand
      });

    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;

      const result = await demandService.updateDemand(
        parseInt(id), 
        req.body, 
        req.user.id, 
        req.user.profile
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Demanda atualizada com sucesso',
        data: result.demand
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DemandController();