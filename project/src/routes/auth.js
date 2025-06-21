const express = require('express');
const authController = require('../controllers/authController');
const validators = require('../utils/validators');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

/**
 * @route POST /api/auth/signin
 * @desc Autenticar utilizador (Cliente, Correspondente ou Admin)
 * @access Public
 */
router.post('/signin', 
  validators.signin,
  handleValidationErrors,
  authController.signin
);

/**
 * @route POST /api/auth/register/client
 * @desc Registar novo cliente
 * @access Public
 */
router.post('/register/client',
  validators.registerClient,
  handleValidationErrors,
  authController.registerClient
);

/**
 * @route POST /api/auth/register/correspondent
 * @desc Registar novo correspondente
 * @access Public
 */
router.post('/register/correspondent',
  validators.registerCorrespondent,
  handleValidationErrors,
  authController.registerCorrespondent
);

/**
 * @route POST /api/auth/verify
 * @desc Verificar validade do token
 * @access Public
 */
router.post('/verify', authController.verifyToken);

module.exports = router;
