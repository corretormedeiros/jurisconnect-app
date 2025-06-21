/*
  # Financial Management and Correspondent Approval System

  1. New Tables
    - `financeiro_movimentacoes`
      - `id` (serial, primary key)
      - `descricao` (varchar, description)
      - `valor` (numeric, amount)
      - `tipo` (enum, ENTRADA/SAIDA)
      - `status` (enum, payment status)
      - `data_vencimento` (date, due date)
      - `data_pagamento` (date, payment date)
      - `diligencia_id` (foreign key, optional)
      - `cliente_id` (foreign key, optional)
      - `correspondente_id` (foreign key, optional)
      - `created_at` (timestamp)

  2. Schema Changes
    - Add `status_aprovacao` column to `correspondentes_servicos` table

  3. Security
    - Enable RLS on new table
    - Add policies for admin access only
*/

-- Create new ENUM types for financial management
CREATE TYPE TIPO_MOVIMENTACAO AS ENUM ('ENTRADA', 'SAIDA');
CREATE TYPE STATUS_FINANCEIRO AS ENUM ('PAGO', 'A_PAGAR', 'RECEBIDO', 'A_RECEBER');
CREATE TYPE STATUS_APROVACAO AS ENUM ('PENDENTE', 'APROVADO', 'REPROVADO');

-- Add approval status column to correspondents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'correspondentes_servicos' AND column_name = 'status_aprovacao'
  ) THEN
    ALTER TABLE correspondentes_servicos ADD COLUMN status_aprovacao STATUS_APROVACAO DEFAULT 'PENDENTE';
  END IF;
END $$;

-- Create financial movements table
CREATE TABLE IF NOT EXISTS financeiro_movimentacoes (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  tipo TIPO_MOVIMENTACAO NOT NULL,
  status STATUS_FINANCEIRO NOT NULL,
  data_vencimento DATE,
  data_pagamento DATE,
  diligencia_id INTEGER REFERENCES demandas(id) ON DELETE SET NULL,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  correspondente_id INTEGER REFERENCES correspondentes_servicos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financeiro_tipo ON financeiro_movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_status ON financeiro_movimentacoes(status);
CREATE INDEX IF NOT EXISTS idx_financeiro_data_vencimento ON financeiro_movimentacoes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_correspondentes_status_aprovacao ON correspondentes_servicos(status_aprovacao);

-- Add trigger for updated_at
CREATE TRIGGER update_financeiro_updated_at 
  BEFORE UPDATE ON financeiro_movimentacoes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE financeiro_movimentacoes ENABLE ROW LEVEL SECURITY;

-- Create policies (admin only access)
CREATE POLICY "Admin can manage financial movements"
  ON financeiro_movimentacoes
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'profile' = 'admin');

-- Insert sample financial data
INSERT INTO financeiro_movimentacoes (descricao, valor, tipo, status, data_vencimento) VALUES
('Pagamento de correspondente - Janeiro', 500.00, 'SAIDA', 'PAGO', '2024-01-15'),
('Recebimento de cliente - Processo 123', 1200.00, 'ENTRADA', 'RECEBIDO', '2024-01-10'),
('Custas processuais', 150.00, 'SAIDA', 'A_PAGAR', '2024-02-01');