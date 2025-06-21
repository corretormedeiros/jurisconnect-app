const clientRepository = require('../repositories/clientRepository');
const addressRepository = require('../repositories/addressRepository');
const authService = require('./authService');
const { HTTP_STATUS } = require('../utils/constants');

class ClientService {
  async createClient(clientData) {
    try {
      // Verificar se email já existe
      const existingClient = await clientRepository.findByEmail(clientData.email);
      if (existingClient) {
        const error = new Error('Email já cadastrado');
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      // Criar endereço
      const address = await addressRepository.create(clientData.endereco);

      // Hash da senha
      const hashedPassword = await authService.hashPassword(clientData.senha);

      // Criar cliente
      const client = await clientRepository.create({
        nome_completo: clientData.nome_completo,
        escritorio: clientData.escritorio,
        telefone: clientData.telefone,
        email: clientData.email,
        senha_hash: hashedPassword
      }, address.id);

      // Buscar cliente completo com endereço
      const clientWithAddress = await clientRepository.findById(client.id);

      return {
        success: true,
        client: {
          ...clientWithAddress,
          endereco: {
            logradouro: clientWithAddress.logradouro,
            numero: clientWithAddress.numero,
            complemento: clientWithAddress.complemento,
            bairro: clientWithAddress.bairro,
            cidade: clientWithAddress.cidade,
            estado: clientWithAddress.estado,
            cep: clientWithAddress.cep
          }
        }
      };

    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async getAllClients(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      const clients = await clientRepository.findAll(limit, offset);
      const total = await clientRepository.count();

      return {
        success: true,
        clients: clients.map(client => ({
          ...client,
          endereco: {
            logradouro: client.logradouro,
            numero: client.numero,
            complemento: client.complemento,
            bairro: client.bairro,
            cidade: client.cidade,
            estado: client.estado,
            cep: client.cep
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
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async getClientById(id) {
    try {
      const client = await clientRepository.findById(id);
      
      if (!client) {
        const error = new Error('Cliente não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return {
        success: true,
        client: {
          ...client,
          endereco: {
            logradouro: client.logradouro,
            numero: client.numero,
            complemento: client.complemento,
            bairro: client.bairro,
            cidade: client.cidade,
            estado: client.estado,
            cep: client.cep
          }
        }
      };

    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }

  async updateClient(id, updateData) {
    try {
      const existingClient = await clientRepository.findById(id);
      if (!existingClient) {
        const error = new Error('Cliente não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Se há dados de endereço, atualizar
      if (updateData.endereco) {
        await addressRepository.update(existingClient.endereco_id, updateData.endereco);
        delete updateData.endereco;
      }

      // Se há nova senha, fazer hash
      if (updateData.senha) {
        updateData.senha_hash = await authService.hashPassword(updateData.senha);
        delete updateData.senha;
      }

      // Verificar email único se está sendo alterado
      if (updateData.email && updateData.email !== existingClient.email) {
        const emailExists = await clientRepository.findByEmail(updateData.email);
        if (emailExists) {
          const error = new Error('Email já cadastrado');
          error.statusCode = HTTP_STATUS.CONFLICT;
          throw error;
        }
      }

      const updatedClient = await clientRepository.update(id, updateData);
      const clientWithAddress = await clientRepository.findById(updatedClient.id);

      return {
        success: true,
        client: {
          ...clientWithAddress,
          endereco: {
            logradouro: clientWithAddress.logradouro,
            numero: clientWithAddress.numero,
            complemento: clientWithAddress.complemento,
            bairro: clientWithAddress.bairro,
            cidade: clientWithAddress.cidade,
            estado: clientWithAddress.estado,
            cep: clientWithAddress.cep
          }
        }
      };

    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async updateClientStatus(id, isActive) {
    try {
      const updatedClient = await clientRepository.updateStatus(id, isActive);
      
      if (!updatedClient) {
        const error = new Error('Cliente não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return {
        success: true,
        client: updatedClient
      };

    } catch (error) {
      console.error('Erro ao atualizar status do cliente:', error);
      throw error;
    }
  }
}

module.exports = new ClientService();