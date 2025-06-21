const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Aplicar autenticação e autorização de admin a todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route GET /api/relatorios/diligencias-por-status
 * @desc Obter relatório de diligências por status
 * @access Admin only
 */
router.get('/diligencias-por-status', reportController.getDemandsByStatus);

/**
 * @route GET /api/relatorios/faturamento-mensal
 * @desc Obter faturamento mensal
 * @access Admin only
 */
router.get('/faturamento-mensal', reportController.getMonthlyRevenue);

/**
 * @route GET /api/relatorios/novos-usuarios
 * @desc Obter relatório de novos usuários
 * @access Admin only
 */
router.get('/novos-usuarios', reportController.getNewUsers);

/**
 * @route GET /api/relatorios/performance-correspondentes
 * @desc Obter performance dos correspondentes
 * @access Admin only
 */
router.get('/performance-correspondentes', reportController.getCorrespondentPerformance);

/**
 * @route GET /api/relatorios/atividade-clientes
 * @desc Obter atividade dos clientes
 * @access Admin only
 */
router.get('/atividade-clientes', reportController.getClientActivity);

module.exports = router;