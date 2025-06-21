# JurisConnect - Backend API

## Descrição

JurisConnect é uma plataforma SaaS completa para gestão de diligências jurídicas, similar à plataforma doc9.com.br. Este repositório contém a API Backend desenvolvida em Node.js com Express.js.

## Funcionalidades

### Perfis de Utilizador
- **Admin**: Controlo total, gestão de utilizadores, supervisão e atribuição de diligências
- **Cliente**: Registo, criação e acompanhamento de demandas
- **Correspondente**: Registo, receção e execução de diligências

### Principais Características
- ✅ Autenticação JWT segura
- ✅ Gestão completa de utilizadores
- ✅ Sistema de demandas jurídicas
- ✅ Upload e gestão de anexos
- ✅ Dashboard administrativo
- ✅ Sistema de auditoria
- ✅ Validação robusta de dados
- ✅ Tratamento centralizado de erros

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Multer** - Upload de ficheiros
- **express-validator** - Validação de dados
- **helmet** - Segurança
- **cors** - Cross-Origin Resource Sharing
- **morgan** - Logging HTTP

## Instalação

### Pré-requisitos
- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seuusuario/jurisconnect-backend.git
cd jurisconnect-backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações da Base de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jurisconnect
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Configurações JWT
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
JWT_EXPIRES_IN=7d

# Configurações de Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

4. **Configure a base de dados**
```bash
# Criar a base de dados PostgreSQL
createdb jurisconnect

# Executar o script de inicialização
psql -U postgres -d jurisconnect -f database/init.sql
```

5. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Estrutura do Projeto

```
src/
├── app.js                 # Aplicação principal
├── config/
│   ├── auth.js           # Configurações de autenticação
│   └── database.js       # Configuração da base de dados
├── controllers/          # Controladores da API
├── middlewares/          # Middlewares personalizados
├── repositories/         # Camada de dados
├── routes/              # Definição de rotas
├── services/            # Lógica de negócio
└── utils/               # Utilitários e constantes
```

## Endpoints da API

### Autenticação
- `POST /api/auth/signin` - Autenticar utilizador
- `POST /api/auth/verify` - Verificar token

### Gestão de Clientes (Admin apenas)
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obter cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `PATCH /api/clientes/:id/status` - Alterar status

### Gestão de Correspondentes (Admin apenas)
- `POST /api/correspondentes` - Criar correspondente
- `GET /api/correspondentes` - Listar correspondentes
- `GET /api/correspondentes/:id` - Obter correspondente
- `PUT /api/correspondentes/:id` - Atualizar correspondente
- `PATCH /api/correspondentes/:id/status` - Alterar status

### Gestão de Demandas
- `POST /api/demandas` - Criar demanda (Cliente)
- `GET /api/demandas/minhas` - Listar minhas demandas
- `GET /api/demandas/:id` - Obter demanda
- `PATCH /api/demandas/assign/:id` - Atribuir correspondente (Admin)
- `PATCH /api/demandas/status/:id` - Alterar status (Admin/Correspondente)
- `PUT /api/demandas/:id` - Atualizar demanda

### Gestão de Anexos
- `POST /api/demandas/:id/anexos` - Upload de anexo
- `GET /api/demandas/:id/anexos` - Listar anexos
- `GET /api/anexos/:id/download` - Download de anexo
- `DELETE /api/anexos/:id` - Remover anexo

### Dashboard (Admin apenas)
- `GET /api/dashboard` - Dados do dashboard
- `GET /api/dashboard/monthly` - Estatísticas mensais

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header Authorization:

```
Authorization: Bearer <seu_token_jwt>
```

### Perfis de Acesso
- `admin` - Acesso total ao sistema
- `cliente` - Acesso às próprias demandas
- `correspondente` - Acesso às demandas atribuídas

## Validação de Dados

Todos os endpoints utilizam validação robusta com `express-validator`:

- Validação de email
- Validação de CPF/CNPJ
- Validação de telefone
- Validação de datas
- Validação de ficheiros

## Tratamento de Erros

O sistema possui tratamento centralizado de erros:

- Erros de validação (400)
- Erros de autenticação (401)
- Erros de autorização (403)
- Recursos não encontrados (404)
- Conflitos de dados (409)
- Erros internos (500)

## Logging e Auditoria

Todas as ações importantes são registadas na tabela `log_atividades`:

- Criação de demandas
- Mudanças de status
- Atribuições de correspondentes
- Upload de anexos
- Atualizações de dados

## Segurança

- Helmet para segurança HTTP
- Rate limiting para prevenir ataques
- CORS configurado adequadamente
- Senhas com hash bcrypt
- Validação de entrada rigorosa
- Logs de auditoria completos

## Desenvolvimento

### Scripts Disponíveis
```bash
npm start          # Inicia o servidor
npm run dev        # Inicia em modo desenvolvimento
npm test           # Executa testes (em desenvolvimento)
```

### Estrutura de Camadas
1. **Routes** - Definição de endpoints e middlewares
2. **Controllers** - Recebem requests e delegam para services
3. **Services** - Lógica de negócio e validações
4. **Repositories** - Acesso aos dados
5. **Middlewares** - Funcionalidades transversais

## Licença

Este projeto está sob a licença ISC.

## Suporte

Para suporte técnico, entre em contato através do email: suporte@jurisconnect.com

---

**JurisConnect Team** - Transformando a gestão jurídica através da tecnologia.