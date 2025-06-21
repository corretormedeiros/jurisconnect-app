const express = require('express');
const clientController = require('../controllers/clientController');
const validators = require('../utils/validators');
const { handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { body } = require('express-validator');

const router = express.Router();

// Aplicar autenticação e autorização de admin a todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route POST /api/clientes
 * @desc Criar novo cliente
 * @access Admin only
 */
router.post('/',
  validators.createClient,
  handleValidationErrors,
  clientController.create
);

/**
 * @route GET /api/clientes
 * @desc Listar todos os clientes
 * @access Admin only
 */
router.get('/', clientController.getAll);

/**
 * @route GET /api/clientes/:id
 * @desc Obter cliente por ID
 * @access Admin only
 */
router.get('/:id',
  // CORREÇÃO: Chamando a função de validação
  validators.validateId(),
  handleValidationErrors,
  clientController.getById
);

/**
 * @route PUT /api/clientes/:id
 * @desc Atualizar cliente
 * @access Admin only
 */
router.put('/:id',
  // CORREÇÃO: Chamando a função de validação
  validators.validateId(),
  handleValidationErrors,
  clientController.update
);

/**
 * @route PATCH /api/clientes/:id/status
 * @desc Atualizar status do cliente (ativo/inativo)
 * @access Admin only
 */
router.patch('/:id/status',
  [
    // CORREÇÃO: Chamando a função de validação e desestruturando o resultado
    ...validators.validateId(),
    body('is_active').isBoolean().withMessage('Status deve ser verdadeiro ou falso')
  ],
  handleValidationErrors,
  clientController.updateStatus
);

module.exports = router;
