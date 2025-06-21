const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Aplicar autenticação e autorização de admin a todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route GET /api/dashboard
 * @desc Obter dados do dashboard administrativo
 * @access Admin only
 */
router.get('/', dashboardController.getDashboardData);

/**
 * @route GET /api/dashboard/monthly
 * @desc Obter estatísticas mensais
 * @access Admin only
 */
router.get('/monthly', dashboardController.getMonthlyStats);

module.exports = router;