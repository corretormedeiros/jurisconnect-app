const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed da base de dados...');

    // Criar admin padrão
    const adminPassword = await bcrypt.hash('admin123', 12);
    await pool.query(`
      INSERT INTO admins (nome, email, senha_hash) VALUES 
      ('Admin JurisConnect', 'admin@jurisconnect.com.br', $1)
      ON CONFLICT (email) DO NOTHING
    `, [adminPassword]);

    // Criar endereços de exemplo
    const endereco1 = await pool.query(`
      INSERT INTO enderecos (logradouro, numero, bairro, cidade, estado, cep)
      VALUES ('Rua das Flores', '123', 'Centro', 'São Paulo', 'SP', '01234-567')
      RETURNING id
    `);

    const endereco2 = await pool.query(`
      INSERT INTO enderecos (logradouro, numero, bairro, cidade, estado, cep)
      VALUES ('Av. Paulista', '1000', 'Cerqueira César', 'São Paulo', 'SP', '01310-100')
      RETURNING id
    `);

    const endereco3 = await pool.query(`
      INSERT INTO enderecos (logradouro, numero, bairro, cidade, estado, cep)
      VALUES ('Rua Oscar Freire', '500', 'Jardins', 'São Paulo', 'SP', '01426-001')
      RETURNING id
    `);

    // Criar cliente de exemplo
    const clientePassword = await bcrypt.hash('cliente123', 12);
    const cliente = await pool.query(`
      INSERT INTO clientes (nome_completo, escritorio, telefone, email, senha_hash, endereco_id)
      VALUES ('João Silva Santos', 'Silva & Associados', '(11) 9999-8888', 'joao@silvaassociados.com.br', $1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [clientePassword, endereco1.rows[0].id]);

    // Criar correspondente advogado
    const correspondente1Password = await bcrypt.hash('corresp123', 12);
    const correspondente1 = await pool.query(`
      INSERT INTO correspondentes_servicos 
      (nome_completo, tipo, oab, rg, cpf, email, telefone, endereco_id, comarcas_atendidas, senha_hash)
      VALUES (
        'Maria Oliveira', 
        'Advogado', 
        'SP123456', 
        '12.345.678-9', 
        '123.456.789-00', 
        'maria@correspondente.com.br', 
        '(11) 8888-7777', 
        $1, 
        'São Paulo, Guarulhos, Osasco, Santo André', 
        $2
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [endereco2.rows[0].id, correspondente1Password]);

    // Criar correspondente preposto
    const correspondente2Password = await bcrypt.hash('preposto123', 12);
    const correspondente2 = await pool.query(`
      INSERT INTO correspondentes_servicos 
      (nome_completo, tipo, rg, cpf, email, telefone, endereco_id, comarcas_atendidas, senha_hash)
      VALUES (
        'Carlos Ferreira', 
        'Preposto', 
        '98.765.432-1', 
        '987.654.321-00', 
        'carlos@preposto.com.br', 
        '(11) 7777-6666', 
        $1, 
        'São Paulo, Campinas, Sorocaba', 
        $2
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [endereco3.rows[0].id, correspondente2Password]);

    // Criar demandas de exemplo se os utilizadores foram criados
    if (cliente.rows.length > 0) {
      await pool.query(`
        INSERT INTO demandas (titulo, descricao_completa, numero_processo, tipo_demanda, valor_proposto_cliente, cliente_id)
        VALUES 
        (
          'Citação em Ação de Cobrança', 
          'Citação do réu José da Silva no processo de cobrança de valores em atraso conforme contrato anexo. Endereço: Rua A, 100 - Centro - São Paulo/SP',
          '1234567-89.2024.8.26.0100',
          'Citação',
          250.00,
          $1
        ),
        (
          'Intimação para Audiência de Conciliação',
          'Intimação da parte para comparecer à audiência de conciliação no Juizado Especial Cível de São Paulo.',
          '9876543-21.2024.8.26.0002',
          'Intimação',
          180.00,
          $1
        )
      `, [cliente.rows[0].id]);
    }

    console.log('✅ Seed da base de dados concluído com sucesso!');
    console.log('');
    console.log('👤 Utilizadores criados:');
    console.log('   Admin: admin@jurisconnect.com.br / admin123');
    console.log('   Cliente: joao@silvaassociados.com.br / cliente123');
    console.log('   Correspondente: maria@correspondente.com.br / corresp123');
    console.log('   Preposto: carlos@preposto.com.br / preposto123');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao fazer seed da base de dados:', error);
  } finally {
    process.exit();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;