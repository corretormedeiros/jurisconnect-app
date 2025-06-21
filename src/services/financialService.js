const financialRepository = require('../repositories/financialRepository');
const { HTTP_STATUS } = require('../utils/constants');

class FinancialService {
  async createMovement(financialData) {
    try {
      const movement = await financialRepository.create(financialData);

      return {
        success: true,
        movement
      };

    } catch (error) {
      console.error('Erro ao criar movimentação financeira:', error);
      throw error;
    }
  }

  async getAllMovements(filters = {}, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      const movements = await financialRepository.findAll(filters, limit, offset);
      const total = await financialRepository.count(filters);

      return {
        success: true,
        movements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Erro ao buscar movimentações financeiras:', error);
      throw error;
    }
  }

  async getMovementById(id) {
    try {
      const movement = await financialRepository.findById(id);
      
      if (!movement) {
        const error = new Error('Movimentação não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return {
        success: true,
        movement
      };

    } catch (error) {
      console.error('Erro ao buscar movimentação:', error);
      throw error;
    }
  }

  async updateMovement(id, updateData) {
    try {
      const existingMovement = await financialRepository.findById(id);
      if (!existingMovement) {
        const error = new Error('Movimentação não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      const updatedMovement = await financialRepository.update(id, updateData);

      return {
        success: true,
        movement: updatedMovement
      };

    } catch (error) {
      console.error('Erro ao atualizar movimentação:', error);
      throw error;
    }
  }

  async deleteMovement(id) {
    try {
      const deletedMovement = await financialRepository.delete(id);
      
      if (!deletedMovement) {
        const error = new Error('Movimentação não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return {
        success: true,
        message: 'Movimentação removida com sucesso'
      };

    } catch (error) {
      console.error('Erro ao remover movimentação:', error);
      throw error;
    }
  }

  async getFinancialSummary() {
    try {
      const summary = await financialRepository.getFinancialSummary();

      return {
        success: true,
        summary: {
          total_entradas: parseFloat(summary.total_entradas) || 0,
          total_saidas: parseFloat(summary.total_saidas) || 0,
          lucro: parseFloat(summary.lucro) || 0,
          total_a_pagar: parseFloat(summary.total_a_pagar) || 0,
          total_a_receber: parseFloat(summary.total_a_receber) || 0
        }
      };

    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      throw error;
    }
  }
}

module.exports = new FinancialService();