const attachmentRepository = require('../repositories/attachmentRepository');
const demandRepository = require('../repositories/demandRepository');
const loggingService = require('./loggingService');
const { HTTP_STATUS, USER_PROFILES } = require('../utils/constants');
const fs = require('fs').promises;
const path = require('path');

class AttachmentService {
  async uploadAttachment(demandId, file, userId, userProfile) {
    try {
      // Verificar se a demanda existe
      const demand = await demandRepository.findById(demandId);
      if (!demand) {
        const error = new Error('Demanda não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Verificar permissões
      if (userProfile !== USER_PROFILES.ADMIN) {
        if (userProfile === USER_PROFILES.CLIENT && demand.cliente_id !== userId) {
          const error = new Error('Acesso negado para enviar anexos a esta demanda');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }

        if (userProfile === USER_PROFILES.CORRESPONDENT && demand.correspondente_id !== userId) {
          const error = new Error('Acesso negado para enviar anexos a esta demanda');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      // Criar registro do anexo
      const attachment = await attachmentRepository.create({
        demanda_id: demandId,
        uploader_id: userId,
        uploader_perfil: userProfile,
        nome_original: file.originalname,
        path_armazenamento: file.path,
        tipo_mime: file.mimetype,
        tamanho_bytes: file.size
      });

      // Log do upload
      await loggingService.logFileUpload(
        demandId,
        userId,
        userProfile,
        file.originalname,
        file.size
      );

      return {
        success: true,
        attachment
      };

    } catch (error) {
      // Se houve erro e o arquivo foi salvo, tentar removê-lo
      if (file && file.path) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Erro ao remover arquivo após falha:', unlinkError);
        }
      }

      console.error('Erro ao fazer upload do anexo:', error);
      throw error;
    }
  }

  async getAttachmentsByDemandId(demandId, userId, userProfile) {
    try {
      // Verificar se a demanda existe
      const demand = await demandRepository.findById(demandId);
      if (!demand) {
        const error = new Error('Demanda não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Verificar permissões
      if (userProfile !== USER_PROFILES.ADMIN) {
        if (userProfile === USER_PROFILES.CLIENT && demand.cliente_id !== userId) {
          const error = new Error('Acesso negado aos anexos desta demanda');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }

        if (userProfile === USER_PROFILES.CORRESPONDENT && demand.correspondente_id !== userId) {
          const error = new Error('Acesso negado aos anexos desta demanda');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      const attachments = await attachmentRepository.findByDemandId(demandId);

      return {
        success: true,
        attachments: attachments.map(attachment => ({
          id: attachment.id,
          nome_original: attachment.nome_original,
          tipo_mime: attachment.tipo_mime,
          tamanho_bytes: attachment.tamanho_bytes,
          uploader_nome: attachment.uploader_nome,
          uploader_perfil: attachment.uploader_perfil,
          created_at: attachment.created_at
        }))
      };

    } catch (error) {
      console.error('Erro ao buscar anexos da demanda:', error);
      throw error;
    }
  }

  async downloadAttachment(attachmentId, userId, userProfile) {
    try {
      const attachment = await attachmentRepository.findById(attachmentId);
      if (!attachment) {
        const error = new Error('Anexo não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Verificar permissões da demanda associada
      const demand = await demandRepository.findById(attachment.demanda_id);
      if (!demand) {
        const error = new Error('Demanda associada não encontrada');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      if (userProfile !== USER_PROFILES.ADMIN) {
        if (userProfile === USER_PROFILES.CLIENT && demand.cliente_id !== userId) {
          const error = new Error('Acesso negado para baixar este anexo');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }

        if (userProfile === USER_PROFILES.CORRESPONDENT && demand.correspondente_id !== userId) {
          const error = new Error('Acesso negado para baixar este anexo');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          throw error;
        }
      }

      // Verificar se o arquivo existe
      try {
        await fs.access(attachment.path_armazenamento);
      } catch (error) {
        const notFoundError = new Error('Arquivo não encontrado no sistema de arquivos');
        notFoundError.statusCode = HTTP_STATUS.NOT_FOUND;
        throw notFoundError;
      }

      return {
        success: true,
        attachment: {
          path: attachment.path_armazenamento,
          nome_original: attachment.nome_original,
          tipo_mime: attachment.tipo_mime
        }
      };

    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
      throw error;
    }
  }

  async deleteAttachment(attachmentId, userId, userProfile) {
    try {
      const attachment = await attachmentRepository.findById(attachmentId);
      if (!attachment) {
        const error = new Error('Anexo não encontrado');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Verificar permissões
      if (userProfile !== USER_PROFILES.ADMIN && attachment.uploader_id !== userId) {
        const error = new Error('Apenas o autor do anexo ou admin pode removê-lo');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Remover arquivo do sistema de arquivos
      try {
        await fs.unlink(attachment.path_armazenamento);
      } catch (error) {
        console.warn('Arquivo já foi removido do sistema de arquivos:', error.message);
      }

      // Remover registro da base de dados
      await attachmentRepository.delete(attachmentId);

      return {
        success: true,
        message: 'Anexo removido com sucesso'
      };

    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      throw error;
    }
  }
}

module.exports = new AttachmentService();