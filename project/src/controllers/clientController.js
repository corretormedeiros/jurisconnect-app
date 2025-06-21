const clientService = require('../services/clientService');
const { HTTP_STATUS } = require('../utils/constants');

class ClientController {
  async create(req, res, next) {
    try {
      const result = await clientService.createClient(req.body);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: result.client
      });

    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await clientService.getAllClients(page, limit);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Clientes recuperados com sucesso',
        data: result.clients,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await clientService.getClientById(parseInt(id));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Cliente encontrado',
        data: result.client
      });

    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await clientService.updateClient(parseInt(id), req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: result.client
      });

    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const result = await clientService.updateClientStatus(parseInt(id), is_active);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Status do cliente atualizado com sucesso',
        data: result.client
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientController();