const express = require('express');
const correspondentController = require('../controllers/correspondentController');
const validators = require('../utils/validators');
const { handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { body } = require('express-validator');

const router = express.Router();

// Aplicar autenticação e autorização de admin a todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route POST /api/correspondentes
 * @desc Criar novo correspondente
 * @access Admin only
 */
router.post('/',
  validators.createCorrespondent,
  handleValidationErrors,
  correspondentController.create
);

/**
 * @route GET /api/correspondentes
 * @desc Listar todos os correspondentes
 * @access Admin only
 */
router.get('/', correspondentController.getAll);

/**
 * @route GET /api/correspondentes/:id
 * @desc Obter correspondente por ID
 * @access Admin only
 */
router.get('/:id',
  // CORREÇÃO: Chamando a função de validação
  validators.validateId(),
  handleValidationErrors,
  correspondentController.getById
);

/**
 * @route PUT /api/correspondentes/:id
 * @desc Atualizar correspondente
 * @access Admin only
 */
router.put('/:id',
  // CORREÇÃO: Chamando a função de validação
  validators.validateId(),
  handleValidationErrors,
  correspondentController.update
);

/**
 * @route PATCH /api/correspondentes/:id/status
 * @desc Atualizar status do correspondente (ativo/inativo)
 * @access Admin only
 */
router.patch('/:id/status',
  [
    // CORREÇÃO: Chamando a função de validação e desestruturando o resultado
    ...validators.validateId(),
    body('is_active').isBoolean().withMessage('Status deve ser verdadeiro ou falso')
  ],
  handleValidationErrors,
  correspondentController.updateStatus
);

module.exports = router;
