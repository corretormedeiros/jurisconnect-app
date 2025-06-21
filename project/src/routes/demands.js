const express = require('express');
const demandController = require('../controllers/demandController');
const validators = require('../utils/validators');
const { handleValidationErrors } = require('../middlewares/validation');
const {
  authenticateToken,
  requireAdmin,
  requireClient,
  requireAdminOrCorrespondent
} = require('../middlewares/auth');
const { body } = require('express-validator');

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/demandas
 * @desc Criar nova demanda
 * @access Cliente only
 */
router.post('/',
  requireClient,
  validators.createDemand,
  handleValidationErrors,
  demandController.create
);

/**
 * @route GET /api/demandas/minhas
 * @desc Obter minhas demandas (baseado no perfil do utilizador)
 * @access Todos os perfis autenticados
 */
router.get('/minhas', demandController.getMyDemands);

/**
 * @route GET /api/demandas/:id
 * @desc Obter demanda por ID
 * @access Admin ou utilizadores relacionados à demanda
 */
router.get('/:id',
  // CORREÇÃO: Chamando a função de validação
  validators.validateId(),
  handleValidationErrors,
  demandController.getById
);

/**
 * @route PATCH /api/demandas/assign/:id
 * @desc Atribuir correspondente a uma demanda
 * @access Admin only
 */
router.patch('/assign/:id',
  requireAdmin,
  [
    // CORREÇÃO: Chamando a função de validação e desestruturando o resultado
    ...validators.validateId(),
    body('correspondente_id')
      .isInt({ min: 1 })
      .withMessage('ID do correspondente deve ser um número inteiro positivo')
  ],
  handleValidationErrors,
  demandController.assignCorrespondent
);

/**
 * @route PATCH /api/demandas/status/:id
 * @desc Atualizar status de uma demanda
 * @access Admin ou correspondente responsável
 */
router.patch('/status/:id',
  requireAdminOrCorrespondent,
  [
    // CORREÇÃO: Chamando a função de validação e desestruturando o resultado
    ...validators.validateId(),
    ...validators.updateStatus
  ],
  handleValidationErrors,
  demandController.updateStatus
);

/**
 * @route PUT /api/demandas/:id
 * @desc Atualizar demanda
 * @access Admin ou utilizadores relacionados à demanda
 */
router.put('/:id',
  // CORREÇÃO: Chamando a função de validação
  validators.validateId(),
  handleValidationErrors,
  demandController.update
);

module.exports = router;
