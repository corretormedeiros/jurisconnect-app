const authService = require('../services/authService');
const { HTTP_STATUS } = require('../utils/constants');

class AuthController {
  async signin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.signin(email, password);

      if (!result.success) {
        return res.status(result.statusCode || HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: result.message
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Autenticação realizada com sucesso',
        data: {
          token: result.token,
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async registerClient(req, res, next) {
    try {
      const result = await authService.registerClient(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: result.client
      });
    } catch (error) {
      next(error);
    }
  }

  async registerCorrespondent(req, res, next) {
    try {
      const result = await authService.registerCorrespondent(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Correspondente criado com sucesso',
        data: result.correspondent
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Token não fornecido'
        });
      }

      const result = await authService.verifyToken(token);

      if (!result.success) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Token inválido'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Token válido',
        user: result.decoded
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
