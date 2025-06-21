const { HTTP_STATUS } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    // Adiciona os erros de validação ao log do console para depuração
    ...(err.errors && { validationErrors: err.errors }),
  });

  // Erro de validação do express-validator
  if (err.type === 'validation') {
    // CORREÇÃO: Retornando a lista detalhada de erros na resposta JSON
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Dados de entrada inválidos. Por favor, verifique os campos.',
      errors: err.errors.map(e => ({ field: e.path, message: e.msg })) // Mapeia para um formato mais amigável
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Erro de base de dados PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Dados duplicados. O email ou CPF informado já existe.'
        });
      case '23503': // Foreign key violation
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Referência inválida nos dados fornecidos.'
        });
      case '23502': // Not null violation
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Campos obrigatórios não preenchidos.'
        });
    }
  }

  // Erro de arquivo muito grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo permitido: 10MB'
    });
  }

  // Erro genérico
  res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
