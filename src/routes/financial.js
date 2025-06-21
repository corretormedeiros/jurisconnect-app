const express = require('express');
const financialController = require('../controllers/financialController');
const validators = require('../utils/validators');
const { handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Aplicar autenticação e autorização de admin a todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route POST /api/financeiro
 * @desc Criar nova movimentação financeira
 * @access Admin only
 */
router.post('/',
  validators.createFinancialMovement,
  handleValidationErrors,
  financialController.create
);

/**
 * @route GET /api/financeiro
 * @desc Listar todas as movimentações financeiras
 * @access Admin only
 */
router.get('/', financialController.getAll);

/**
 * @route GET /api/financeiro/resumo
 * @desc Obter resumo financeiro
 * @access Admin only
 */
router.get('/resumo', financialController.getSummary);

/**
 * @route GET /api/financeiro/:id
 * @desc Obter movimentação por ID
 * @access Admin only
 */
router.get('/:id',
  validators.validateId(),
  handleValidationErrors,
  financialController.getById
);

/**
 * @route PUT /api/financeiro/:id
 * @desc Atualizar movimentação financeira
 * @access Admin only
 */
router.put('/:id',
  [
    ...validators.validateId(),
    ...validators.updateFinancialMovement
  ],
  handleValidationErrors,
  financialController.update
);

/**
 * @route DELETE /api/financeiro/:id
 * @desc Remover movimentação financeira
 * @access Admin only
 */
router.delete('/:id',
  validators.validateId(),
  handleValidationErrors,
  financialController.delete
);

module.exports = router;