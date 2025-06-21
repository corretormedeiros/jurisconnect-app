-- SCRIPT DE INICIALIZAÇÃO DA BASE DE DADOS JURISCONNECT
-- Este script cria toda a estrutura necessária para a aplicação

-- DELETA AS TABELAS E TIPOS ANTIGOS SE ELES EXISTIREM, PARA GARANTIR UM ESTADO LIMPO
DROP TABLE IF EXISTS log_atividades CASCADE;
DROP TABLE IF EXISTS anexos_demandas CASCADE;
DROP TABLE IF EXISTS demandas CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS correspondentes_servicos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS enderecos CASCADE;
DROP TYPE IF EXISTS TIPO_USUARIO_CORRESPONDENTE;
DROP TYPE IF EXISTS STATUS_DILIGENCIA;
DROP TYPE IF EXISTS TIPO_LOG_ATIVIDADE;

-- RECRIA OS TIPOS PERSONALIZADOS (ENUMS)
CREATE TYPE TIPO_USUARIO_CORRESPONDENTE AS ENUM ('Advogado', 'Preposto');
CREATE TYPE STATUS_DILIGENCIA AS ENUM ('Pendente', 'Em Andamento', 'Cumprida', 'Cancelada');
CREATE TYPE TIPO_LOG_ATIVIDADE AS ENUM ('CRIACAO', 'ATUALIZACAO', 'MUDANCA_STATUS', 'COMENTARIO', 'UPLOAD_ANEXO');

-- Tabela de Endereços Normalizada
CREATE TABLE enderecos (
    id SERIAL PRIMARY KEY,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    escritorio VARCHAR(255),
    telefone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    endereco_id INTEGER REFERENCES enderecos(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Correspondentes
CREATE TABLE correspondentes_servicos (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    tipo TIPO_USUARIO_CORRESPONDENTE NOT NULL,
    oab VARCHAR(20) UNIQUE,
    rg VARCHAR(20) UNIQUE,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(50) NOT NULL,
    endereco_id INTEGER REFERENCES enderecos(id) ON DELETE SET NULL,
    comarcas_atendidas TEXT NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_oab_if_advogado CHECK (
        (tipo = 'Advogado' AND oab IS NOT NULL AND oab <> '') OR (tipo <> 'Advogado')
    )
);

-- Tabela de Administradores
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Principal de Demandas
CREATE TABLE demandas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao_completa TEXT NOT NULL,
    numero_processo VARCHAR(255),
    tipo_demanda VARCHAR(100),
    prazo_fatal DATE,
    status STATUS_DILIGENCIA NOT NULL DEFAULT 'Pendente',
    valor_proposto_cliente NUMERIC(12, 2) NOT NULL DEFAULT 0,
    valor_pago_correspondente NUMERIC(12, 2) DEFAULT 0,
    custas_extras NUMERIC(12, 2) DEFAULT 0,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    correspondente_id INTEGER REFERENCES correspondentes_servicos(id) ON DELETE SET NULL,
    admin_responsavel_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Anexos
CREATE TABLE anexos_demandas (
    id SERIAL PRIMARY KEY,
    demanda_id INTEGER NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    uploader_id INTEGER NOT NULL,
    uploader_perfil VARCHAR(20) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    path_armazenamento VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100),
    tamanho_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs de Auditoria
CREATE TABLE log_atividades (
    id BIGSERIAL PRIMARY KEY,
    demanda_id INTEGER REFERENCES demandas(id) ON DELETE CASCADE,
    ator_id INTEGER NOT NULL,
    ator_perfil VARCHAR(20) NOT NULL,
    tipo_log TIPO_LOG_ATIVIDADE NOT NULL,
    detalhes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para Performance
CREATE INDEX idx_demandas_cliente_id ON demandas(cliente_id);
CREATE INDEX idx_demandas_correspondente_id ON demandas(correspondente_id);
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_demandas_created_at ON demandas(created_at);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_is_active ON clientes(is_active);
CREATE INDEX idx_correspondentes_email ON correspondentes_servicos(email);
CREATE INDEX idx_correspondentes_is_active ON correspondentes_servicos(is_active);
CREATE INDEX idx_correspondentes_tipo ON correspondentes_servicos(tipo);
CREATE INDEX idx_log_atividades_demanda_id ON log_atividades(demanda_id);
CREATE INDEX idx_log_atividades_created_at ON log_atividades(created_at);
CREATE INDEX idx_anexos_demanda_id ON anexos_demandas(demanda_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_enderecos_updated_at BEFORE UPDATE ON enderecos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_correspondentes_updated_at BEFORE UPDATE ON correspondentes_servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demandas_updated_at BEFORE UPDATE ON demandas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais (Admin padrão)
-- Senha: admin123 (deve ser alterada após primeiro login)
INSERT INTO admins (nome, email, senha_hash) VALUES 
('Administrador', 'admin@jurisconnect.com', '$2a$12$rQV8G7p7jKZLKVHCfJYBGefJ9.6KZvVPYhWJJqOeVJtJEKcqRg.9u');

-- Comentários sobre o schema
COMMENT ON TABLE enderecos IS 'Tabela normalizada para armazenar endereços de clientes e correspondentes';
COMMENT ON TABLE clientes IS 'Tabela de clientes do sistema - escritórios de advocacia';
COMMENT ON TABLE correspondentes_servicos IS 'Tabela de correspondentes - advogados e prepostos';
COMMENT ON TABLE admins IS 'Tabela de administradores do sistema';
COMMENT ON TABLE demandas IS 'Tabela principal de demandas jurídicas';
COMMENT ON TABLE anexos_demandas IS 'Tabela de anexos das demandas';
COMMENT ON TABLE log_atividades IS 'Tabela de auditoria e logs de atividades';

-- Verificar se a estrutura foi criada corretamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('enderecos', 'clientes', 'correspondentes_servicos', 'admins', 'demandas', 'anexos_demandas', 'log_atividades')
ORDER BY tablename;

-- Mostrar informações sobre os tipos criados
SELECT typname, typtype FROM pg_type WHERE typname IN ('tipo_usuario_correspondente', 'status_diligencia', 'tipo_log_atividade');

PRINT 'Base de dados JurisConnect inicializada com sucesso!';