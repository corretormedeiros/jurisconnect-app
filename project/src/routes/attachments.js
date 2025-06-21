const express = require('express');
const attachmentController = require('../controllers/attachmentController');
const validators = require('../utils/validators');
const { handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');

const router = express.Router({ mergeParams: true });

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/demandas/:id/anexos
 * @desc Fazer upload de anexo para uma demanda
 * @access Admin ou utilizadores relacionados à demanda
 */
router.post('/',
  upload.single('arquivo'),
  handleUploadError,
  attachmentController.upload
);

/**
 * @route GET /api/demandas/:id/anexos
 * @desc Listar anexos de uma demanda
 * @access Admin ou utilizadores relacionados à demanda
 */
router.get('/', attachmentController.getByDemandId);

/**
 * @route GET /api/anexos/:attachmentId/download
 * @desc Baixar um anexo específico
 * @access Admin ou utilizadores relacionados à demanda
 */
router.get('/:attachmentId/download',
  // CORREÇÃO FINAL: Chamando a função de validação com o nome do parâmetro correto.
  validators.validateId('attachmentId'),
  handleValidationErrors,
  attachmentController.download
);

/**
 * @route DELETE /api/anexos/:attachmentId
 * @desc Remover anexo
 * @access Admin ou autor do anexo
 */
router.delete('/:attachmentId',
  // CORREÇÃO FINAL: Chamando a função de validação com o nome do parâmetro correto.
  validators.validateId('attachmentId'),
  handleValidationErrors,
  attachmentController.delete
);

module.exports = router;
