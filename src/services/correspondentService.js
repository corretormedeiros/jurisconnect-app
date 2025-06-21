const correspondentRepository = require('../repositories/correspondentRepository');
const addressRepository = require('../repositories/addressRepository');
const authService = require('./authService');
const { HTTP_STATUS, CORRESPONDENT_TYPES } = require('../utils/constants');

class CorrespondentService {
  async createCorrespondent(correspondentData) {
    try {
      // Verificar se email já existe
      const existingEmail = await correspondentRepository.findByEmail(correspondentData.email);
      if (existingEmail) {
        const error = new Error('Email já cadastrado');
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      // Verificar se CPF já existe
      const existingCpf = await correspondentRepository.findByCpf(correspondentData.cpf);
      if (existingCpf) {
        const error = new Error('CPF já cadastrado');
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      // Se for advogado, verificar OAB
      if (correspondentData.tipo === CORRESPONDENT_TYPES.LAWYER) {
        if (!correspondentData.oab) {
          const error = new Error('OAB é obrigatório para advogados');
          error.statusCode = HTTP_STATUS.BAD_REQUEST;
          throw error;
        }

        const existingOab = await correspondentRepository.findByOab(correspondentData.oab);
        if (existingOab) {
          const error = new Error('OAB já cadastrado');
          error.statusCode = HTTP_STATUS.CONFLICT;
          throw error;
        }
      }

      // Criar endereço
      const address = await addressRepository.create(correspondentData.endereco);

      // Hash da senha
      const hashedPassword = await authService.hashPassword(correspondentData.senha);

      // Criar correspondente
      const correspondent = await correspondentRepository.create({
        nome_completo: correspondentData.nome_completo,
        tipo: correspondentData.tipo,
        oab: correspondentData.oab,
        rg: correspondentData.rg,
        cpf: correspondentData.cpf,
        email: correspondentData.email,
        telefone: correspondentData.telefone,
        comarcas_atendidas: correspondentData.comarcas_atendidas,
        senha_hash: hashedPassword
      }, address.id);

      // Buscar correspondente completo com endereço
      const correspondentWithAddress = await correspondentRepository.findById(correspondent.id);

      return {
        success: true,
        correspondent: {
          ...correspondentWithAddress,
          endereco: {
            logradouro: correspondentWithAddress.logradouro,
            numero: correspondentWithAddress.numero,
            complemento: correspondentWithAddress.complemento,
            bairro: correspondentWithAddress.bairro,
            cidade: correspondentWithAddress.cidade,
            estado: correspondentWithAddress.estado,
            cep: correspondentWithAddress.cep
          }
        }
      };

    } catch (error) {
      console.error('Erro ao criar correspondente:', error);
      throw error;
    }
  }

  async getAllCorrespondents(page = 1, limit = 50, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const correspondents = await correspondentRepository.findAll(limit, offset, filters);
      const total = await correspondentRepository.count();

      return {
        success: true,
        correspondents: correspondents.map(correspondent => ({
          ...correspondent,
          endereco: {
            logradouro: correspondent.logradouro,
            numero: correspondent.numero,
            complemento: correspondent.complemento,
            bairro: correspondent.bairro,
            cidade: correspondent.cidade,
            estado: correspondent.estado,
            cep: correspondent.cep
          }
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Erro ao buscar correspondentes:', error);
      throw error;
    }
  }

  async getPendingApprovals() {
    try {
      const correspondents = await correspondentRepository.findByApprovalStatus('PENDENTE');

      return {
        success: true,
        correspondents: correspondents.map(correspondent => ({
          ...correspondent,
          endereco: {
            logradouro: correspondent.logradouro,
            numero: correspondent.numero,
            complemento: correspondent.complemento,
            bairro: correspondent.bairro,
            cidade: correspondent.cidade,
            estado: correspondent.estado,
            cep: correspondent.cep
          }
        }))
      };

    } catch (error) {
      console.error('Erro ao buscar correspondentes pendentes:', error);
      throw error;
    }
  }

  async approveCorrespondent(id) {
    try {
      const correspondent = await correspondentRepository.findById(id);
      if (!correspondent) {
        const error = new Error('Correspondente não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      const updatedCorrespondent = await correspondentRepository.updateApprovalStatus(id, 'APROVADO');

      return {
        success: true,
        correspondent: updatedCorrespondent,
        message: 'Correspondente aprovado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao aprovar correspondente:', error);
      throw error;
    }
  }

  async rejectCorrespondent(id) {
    try {
      const correspondent = await correspondentRepository.findById(id);
      if (!correspondent) {
        const error = new Error('Correspondente não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      const updatedCorrespondent = await correspondentRepository.updateApprovalStatus(id, 'REPROVADO');

      return {
        success: true,
        correspondent: updatedCorrespondent,
        message: 'Correspondente reprovado'
      };

    } catch (error) {
      console.error('Erro ao reprovar correspondente:', error);
      throw error;
    }
  }

  async getCorrespondentById(id) {
    try {
      const correspondent = await correspondentRepository.findById(id);
      
      if (!correspondent) {
        const error = new Error('Correspondente não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return {
        success: true,
        correspondent: {
          ...correspondent,
          endereco: {
            logradouro: correspondent.logradouro,
            numero: correspondent.numero,
            complemento: correspondent.complemento,
            bairro: correspondent.bairro,
            cidade: correspondent.cidade,
            estado: correspondent.estado,
            cep: correspondent.cep
          }
        }
      };

    } catch (error) {
      console.error('Erro ao buscar correspondente:', error);
      throw error;
    }
  }

  async updateCorrespondent(id, updateData) {
    try {
      const existingCorrespondent = await correspondentRepository.findById(id);
      if (!existingCorrespondent) {
        const error = new Error('Correspondente não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Se há dados de endereço, atualizar
      if (updateData.endereco) {
        await addressRepository.update(existingCorrespondent.endereco_id, updateData.endereco);
        delete updateData.endereco;
      }

      // Se há nova senha, fazer hash
      if (updateData.senha) {
        updateData.senha_hash = await authService.hashPassword(updateData.senha);
        delete updateData.senha;
      }

      // Verificar email único se está sendo alterado
      if (updateData.email && updateData.email !== existingCorrespondent.email) {
        const emailExists = await correspondentRepository.findByEmail(updateData.email);
        if (emailExists) {
          const error = new Error('Email já cadastrado');
          error.statusCode = HTTP_STATUS.CONFLICT;
          throw error;
        }
      }

      // Verificar CPF único se está sendo alterado
      if (updateData.cpf && updateData.cpf !== existingCorrespondent.cpf) {
        const cpfExists = await correspondentRepository.findByCpf(updateData.cpf);
        if (cpfExists) {
          const error = new Error('CPF já cadastrado');
          error.statusCode = HTTP_STATUS.CONFLICT;
          throw error;
        }
      }

      // Verificar OAB único se está sendo alterado
      if (updateData.oab && updateData.oab !== existingCorrespondent.oab) {
        const oabExists = await correspondentRepository.findByOab(updateData.oab);
        if (oabExists) {
          const error = new Error('OAB já cadastrado');
          error.statusCode = HTTP_STATUS.CONFLICT;
          throw error;
        }
      }

      const updatedCorrespondent = await correspondentRepository.update(id, updateData);
      const correspondentWithAddress = await correspondentRepository.findById(updatedCorrespondent.id);

      return {
        success: true,
        correspondent: {
          ...correspondentWithAddress,
          endereco: {
            logradouro: correspondentWithAddress.logradouro,
            numero: correspondentWithAddress.numero,
            complemento: correspondentWithAddress.complemento,
            bairro: correspondentWithAddress.bairro,
            cidade: correspondentWithAddress.cidade,
            estado: correspondentWithAddress.estado,
            cep: correspondentWithAddress.cep
          }
        }
      };

    } catch (error) {
      console.error('Erro ao atualizar correspondente:', error);
      throw error;
    }
  }

  async updateCorrespondentStatus(id, isActive) {
    try {
      const updatedCorrespondent = await correspondentRepository.updateStatus(id, isActive);
      
      if (!updatedCorrespondent) {
        const error = new Error('Correspondente não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return {
        success: true,
        correspondent: updatedCorrespondent
      };

    } catch (error) {
      console.error('Erro ao atualizar status do correspondente:', error);
      throw error;
    }
  }

  async findAvailableCorrespondents(comarcas) {
    try {
      const correspondents = await correspondentRepository.findAvailableForDemand(comarcas);
      
      return {
        success: true,
        correspondents
      };

    } catch (error) {
      console.error('Erro ao buscar correspondentes disponíveis:', error);
      throw error;
    }
  }
}

module.exports = new CorrespondentService();