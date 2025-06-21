const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clientRepository = require('../repositories/clientRepository');
const correspondentRepository = require('../repositories/correspondentRepository');
const adminRepository = require('../repositories/adminRepository');
const addressRepository = require('../repositories/addressRepository');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } = require('../config/auth');
const { USER_PROFILES, HTTP_STATUS, CORRESPONDENT_TYPES } = require('../utils/constants');

class AuthService {
  async hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  async signin(email, password) {
    // ... (código de signin existente - sem alterações)
  }

  async registerClient(clientData) {
    // Lógica movida de clientService
    const existingClient = await clientRepository.findByEmail(clientData.email);
    if (existingClient) {
      const error = new Error('Email já cadastrado');
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const address = await addressRepository.create(clientData.endereco);
    const hashedPassword = await this.hashPassword(clientData.senha);

    const client = await clientRepository.create({
      ...clientData,
      senha_hash: hashedPassword
    }, address.id);
    
    // Omitir a senha do retorno
    const { senha_hash, ...clientResult } = client;
    return { success: true, client: clientResult };
  }

  async registerCorrespondent(correspondentData) {
    // Lógica movida de correspondentService
    const existingEmail = await correspondentRepository.findByEmail(correspondentData.email);
    if (existingEmail) {
      const error = new Error('Email já cadastrado');
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const existingCpf = await correspondentRepository.findByCpf(correspondentData.cpf);
    if (existingCpf) {
      const error = new Error('CPF já cadastrado');
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    if (correspondentData.tipo === CORRESPONDENT_TYPES.LAWYER) {
      if (!correspondentData.oab) {
        const error = new Error('OAB é obrigatório para advogados');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }
      const existingOab = await correspondentRepository.findByOab(correspondentData.oab);
      if (existingOab) {
        const error = new Error('OAB já cadastrada');
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }
    }

    const address = await addressRepository.create(correspondentData.endereco);
    const hashedPassword = await this.hashPassword(correspondentData.senha);

    const correspondent = await correspondentRepository.create({
      ...correspondentData,
      senha_hash: hashedPassword
    }, address.id);

    const { senha_hash, ...correspondentResult } = correspondent;
    return { success: true, correspondent: correspondentResult };
  }

  async verifyToken(token) {
    // ... (código de verifyToken existente - sem alterações)
  }
}

// Preencher a função de signin que foi omitida
AuthService.prototype.signin = async function(email, password) {
    try {
        let user = await clientRepository.findByEmail(email);
        if (user && user.is_active) {
            const isValidPassword = await this.comparePassword(password, user.senha_hash);
            if (isValidPassword) {
                const token = this.generateToken({ id: user.id, profile: USER_PROFILES.CLIENT, email: user.email });
                return { success: true, token, user: { id: user.id, nome: user.nome_completo, email: user.email, profile: USER_PROFILES.CLIENT }};
            }
        }
        user = await correspondentRepository.findByEmail(email);
        if (user && user.is_active) {
            const isValidPassword = await this.comparePassword(password, user.senha_hash);
            if (isValidPassword) {
                const token = this.generateToken({ id: user.id, profile: USER_PROFILES.CORRESPONDENT, email: user.email });
                return { success: true, token, user: { id: user.id, nome: user.nome_completo, email: user.email, profile: USER_PROFILES.CORRESPONDENT, tipo: user.tipo }};
            }
        }
        user = await adminRepository.findByEmail(email);
        if (user && user.is_active) {
            const isValidPassword = await this.comparePassword(password, user.senha_hash);
            if (isValidPassword) {
                await adminRepository.updateLastLogin(user.id);
                const token = this.generateToken({ id: user.id, profile: USER_PROFILES.ADMIN, email: user.email });
                return { success: true, token, user: { id: user.id, nome: user.nome, email: user.email, profile: USER_PROFILES.ADMIN }};
            }
        }
        return { success: false, message: 'Credenciais inválidas ou usuário inativo', statusCode: HTTP_STATUS.UNAUTHORIZED };
    } catch (error) {
        console.error('Erro no serviço de autenticação:', error);
        throw new Error('Erro interno no processo de autenticação');
    }
};

AuthService.prototype.verifyToken = async function(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { success: true, decoded };
    } catch (error) {
      return { success: false, error: error.message };
    }
};

module.exports = new AuthService();
