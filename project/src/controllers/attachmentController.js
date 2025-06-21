const attachmentService = require('../services/attachmentService');
const { HTTP_STATUS } = require('../utils/constants');

class AttachmentController {
  async upload(req, res, next) {
    try {
      const { id } = req.params; // demanda ID
      const file = req.file;

      if (!file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      const result = await attachmentService.uploadAttachment(
        parseInt(id), 
        file, 
        req.user.id, 
        req.user.profile
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Anexo enviado com sucesso',
        data: result.attachment
      });

    } catch (error) {
      next(error);
    }
  }

  async getByDemandId(req, res, next) {
    try {
      const { id } = req.params; // demanda ID

      const result = await attachmentService.getAttachmentsByDemandId(
        parseInt(id), 
        req.user.id, 
        req.user.profile
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Anexos recuperados com sucesso',
        data: result.attachments
      });

    } catch (error) {
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const { attachmentId } = req.params;

      const result = await attachmentService.downloadAttachment(
        parseInt(attachmentId), 
        req.user.id, 
        req.user.profile
      );

      // Configurar headers para download
      res.setHeader('Content-Disposition', `attachment; filename="${result.attachment.nome_original}"`);
      res.setHeader('Content-Type', result.attachment.tipo_mime || 'application/octet-stream');

      // Enviar o arquivo
      const path = require('path');
      const absolutePath = path.resolve(result.attachment.path);
      res.download(absolutePath, result.attachment.nome_original);


    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { attachmentId } = req.params;

      const result = await attachmentService.deleteAttachment(
        parseInt(attachmentId), 
        req.user.id, 
        req.user.profile
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttachmentController();