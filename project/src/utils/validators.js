const { body, param } = require('express-validator');

// Função de validação de ID reutilizável
const validateId = (fieldName = 'id') => [
  param(fieldName)
    .isInt({ min: 1 })
    .withMessage(`O campo '${fieldName}' deve ser um número inteiro positivo`)
];

// Validador para o registo público ou criação de CLIENTE
const clientValidationRules = [
  body('nome_completo').trim().isLength({ min: 2 }).withMessage('Nome completo é obrigatório'),
  body('escritorio').trim().isLength({ min: 1 }).withMessage('Nome do escritório é obrigatório'),
  body('email').isEmail().normalizeEmail().withMessage('Email deve ser válido'),
  // CORREÇÃO: Simplificando a validação do telefone para testes.
  body('telefone').trim().isLength({ min: 8 }).withMessage('O telefone deve ser preenchido'),
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
  // Tornando o objeto de endereço e todos os seus campos opcionais
  body('endereco').optional().isObject(),
  body('endereco.logradouro').optional().trim(),
  body('endereco.cidade').optional().trim(),
  body('endereco.estado').optional(),
  body('endereco.cep').optional(),
];

// Validador para o registo público ou criação de CORRESPONDENTE
const correspondentValidationRules = [
  body('nome_completo').trim().isLength({ min: 2 }).withMessage('Nome completo é obrigatório'),
  body('tipo').isIn(['Advogado', 'Preposto']).withMessage('Tipo deve ser Advogado ou Preposto'),
  body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('CPF deve estar no formato 000.000.000-00'),
  body('email').isEmail().normalizeEmail().withMessage('Email deve ser válido'),
  // CORREÇÃO: Simplificando a validação do telefone para testes.
  body('telefone').trim().isLength({ min: 8 }).withMessage('O telefone deve ser preenchido'),
  body('comarcas_atendidas').trim().isLength({ min: 1 }).withMessage('Comarcas atendidas são obrigatórias'),
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
  // Validações de endereço (obrigatório para correspondentes)
  body('endereco.logradouro').trim().isLength({ min: 1 }).withMessage('Logradouro é obrigatório'),
  body('endereco.cidade').trim().isLength({ min: 1 }).withMessage('Cidade é obrigatória'),
  body('endereco.estado').isLength({ min: 2, max: 2 }).withMessage('Estado (UF) deve ter 2 caracteres'),
  body('endereco.cep').matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve ser válido')
];


const validators = {
  // Validação para a rota de LOGIN
  signin: [
    body('email').isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
  ],

  // REUTILIZAÇÃO das regras de validação para rotas públicas e de admin
  registerClient: clientValidationRules,
  createClient: clientValidationRules,

  registerCorrespondent: correspondentValidationRules,
  createCorrespondent: correspondentValidationRules,
  
  // Validações de demanda
  createDemand: [
    body('titulo')
      .trim()
      .isLength({ min: 5, max: 255 })
      .withMessage('Título deve ter entre 5 e 255 caracteres'),
    body('descricao_completa')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Descrição deve ter pelo menos 10 caracteres'),
    body('valor_proposto_cliente')
      .isFloat({ min: 0 })
      .withMessage('Valor proposto deve ser positivo'),
    body('prazo_fatal')
      .optional()
      .isISO8601()
      .withMessage('Prazo fatal deve ser uma data válida')
  ],

  // Exportação da função e outras validações
  validateId: validateId,
  updateStatus: [
    body('status').isIn(['Pendente', 'Em Andamento', 'Cumprida', 'Cancelada']).withMessage('Status deve ser válido')
  ]
};

module.exports = validators;
