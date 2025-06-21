const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../utils/constants');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.type = 'validation';
    error.errors = errors.array();
    return next(error);
  }
  
  next();
};

module.exports = {
  handleValidationErrors
};