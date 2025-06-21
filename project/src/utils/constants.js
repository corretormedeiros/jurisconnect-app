module.exports = {
  USER_PROFILES: {
    ADMIN: 'admin',
    CLIENT: 'cliente',
    CORRESPONDENT: 'correspondente'
  },
  
  DEMAND_STATUS: {
    PENDING: 'Pendente',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Cumprida',
    CANCELLED: 'Cancelada'
  },
  
  CORRESPONDENT_TYPES: {
    LAWYER: 'Advogado',
    REPRESENTATIVE: 'Preposto'
  },
  
  LOG_TYPES: {
    CREATION: 'CRIACAO',
    UPDATE: 'ATUALIZACAO',
    STATUS_CHANGE: 'MUDANCA_STATUS',
    COMMENT: 'COMENTARIO',
    FILE_UPLOAD: 'UPLOAD_ANEXO'
  },
  
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  }
};