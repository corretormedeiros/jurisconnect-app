const correspondentService = require('../services/correspondentService');
const { HTTP_STATUS } = require('../utils/constants');

class CorrespondentController {
  async create(req, res, next) {
    try {
      const result = await correspondentService.createCorrespondent(req.body);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Correspondente criado com sucesso',
        data: result.correspondent
      });

    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await correspondentService.getAllCorrespondents(page, limit);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Correspondentes recuperados com sucesso',
        data: result.correspondents,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await correspondentService.getCorrespondentById(parseInt(id));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Correspondente encontrado',
        data: result.correspondent
      });

    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await correspondentService.updateCorrespondent(parseInt(id), req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Correspondente atualizado com sucesso',
        data: result.correspondent
      });

    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const result = await correspondentService.updateCorrespondentStatus(parseInt(id), is_active);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Status do correspondente atualizado com sucesso',
        data: result.correspondent
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CorrespondentController();