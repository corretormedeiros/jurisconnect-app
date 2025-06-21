const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');
const { HTTP_STATUS, USER_PROFILES } = require('../utils/constants');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token de acesso requerido'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(err);
    }
    
    req.user = {
      id: decoded.id,
      profile: decoded.profile,
      email: decoded.email
    };
    
    next();
  });
};

const authorizeProfiles = (...allowedProfiles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!allowedProfiles.includes(req.user.profile)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Acesso negado. Perfil não autorizado.'
      });
    }

    next();
  };
};

const requireAdmin = authorizeProfiles(USER_PROFILES.ADMIN);
const requireClient = authorizeProfiles(USER_PROFILES.CLIENT);
const requireCorrespondent = authorizeProfiles(USER_PROFILES.CORRESPONDENT);
const requireAdminOrClient = authorizeProfiles(USER_PROFILES.ADMIN, USER_PROFILES.CLIENT);
const requireAdminOrCorrespondent = authorizeProfiles(USER_PROFILES.ADMIN, USER_PROFILES.CORRESPONDENT);

module.exports = {
  authenticateToken,
  authorizeProfiles,
  requireAdmin,
  requireClient,
  requireCorrespondent,
  requireAdminOrClient,
  requireAdminOrCorrespondent
};