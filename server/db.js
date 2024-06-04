const { Pool } = require('pg');

// Configurações do banco de dados
const pool = new Pool({
    user: 'postgres', // Substitua pelo seu usuário
    host: 'localhost',
    database: 'paldesports',
    password: '!Sql@developer1', // Substitua pela senha que você definiu
    port: 5432,
});

// Função para testar a conexão
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conexão bem-sucedida:', res.rows[0]);
    }
});

module.exports = pool;
