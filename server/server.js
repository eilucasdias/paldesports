const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { generateToken } = require('./auth');

const app = express();
const port = 3000;

const secretKey = '!Sql@developer10'; // Substitua por uma chave secreta forte

app.use(express.json());

// Middleware para verificar o token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Authorization Header:', authHeader); // Adicionando log
    console.log('Token:', token); // Adicionando log

    if (token == null) {
        console.log('Token não encontrado'); // Adicionando log
        return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.log('Erro ao verificar o token:', err.message); // Adicionando log
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor está funcionando!');
});

// Função para verificar se o banco de dados está vazio
async function isFirstUser() {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10) === 0;
}

// Rota para login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).send('Email ou senha incorretos');
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).send('Email ou senha incorretos');
        }

        const token = generateToken(user.rows[0]);
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para logout (opcional, apenas para frontend manipulação)
app.post('/logout', (req, res) => {
    res.json({ message: 'Logout bem-sucedido' });
});

// Rota para obter todos os usuários (protegida)
app.get('/users', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para criar um novo usuário
app.post('/users', async (req, res) => {
    try {
        console.log('Recebendo requisição para criar um usuário:', req.body);
        const { name, email, password, confirm_password, address, address_complement, address_number, profile_type } = req.body;
        let access_level = req.body.access_level || 'Cliente';

        // Verificar se o email já existe
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).send('Email já cadastrado');
        }

        if (password !== confirm_password) {
            return res.status(400).send('As senhas não coincidem');
        }

        // Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (await isFirstUser()) {
            access_level = 'Administrador';
        }

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, confirm_password, address, address_complement, address_number, profile_type, access_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name, email, hashedPassword, hashedPassword, address, address_complement, address_number, profile_type, access_level]
        );
        console.log('Usuário criado com sucesso:', newUser.rows[0]);
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error('Erro ao criar usuário:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para atualizar um usuário (protegida)
app.put('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, confirm_password, address, address_complement, address_number, profile_type, access_level } = req.body;
        const updatedUser = await pool.query(
            'UPDATE users SET name = $1, email = $2, password = $3, confirm_password = $4, address = $5, address_complement = $6, address_number = $7, profile_type = $8, access_level = $9 WHERE id = $10 RETURNING *',
            [name, email, password, confirm_password, address, address_complement, address_number, profile_type, access_level, id]
        );
        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para deletar um usuário (protegida)
app.delete('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.send('Usuário deletado com sucesso');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para obter todos os produtos (protegida)
app.get('/products', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para criar um novo produto (protegida)
app.post('/products', authenticateToken, async (req, res) => {
    try {
        const { user_id, title, image_url, verified, platform, rank_i_price, rank_ii_price, rank_iii_price, details } = req.body;
        const newProduct = await pool.query(
            'INSERT INTO products (user_id, title, image_url, verified, platform, rank_i_price, rank_ii_price, rank_iii_price, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [user_id, title, image_url, verified, platform, rank_i_price, rank_ii_price, rank_iii_price, details]
        );
        res.json(newProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para atualizar um produto (protegida)
app.put('/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, title, image_url, verified, platform, rank_i_price, rank_ii_price, rank_iii_price, details } = req.body;
        const updatedProduct = await pool.query(
            'UPDATE products SET user_id = $1, title = $2, image_url = $3, verified = $4, platform = $5, rank_i_price = $6, rank_ii_price = $7, rank_iii_price = $8, details = $9 WHERE id = $10 RETURNING *',
            [user_id, title, image_url, verified, platform, rank_i_price, rank_ii_price, rank_iii_price, details, id]
        );
        res.json(updatedProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para deletar um produto (protegida)
app.delete('/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.send('Produto deletado com sucesso');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para obter todos os pedidos (protegida)
app.get('/orders', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para criar um novo pedido (protegida)
app.post('/orders', authenticateToken, async (req, res) => {
    try {
        const { user_id, product_id, status, total_price, payment_method, details } = req.body;
        const newOrder = await pool.query(
            'INSERT INTO orders (user_id, product_id, status, total_price, payment_method, details) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, product_id, status, total_price, payment_method, details]
        );
        res.json(newOrder.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para atualizar um pedido (protegida)
app.put('/orders/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, product_id, status, total_price, payment_method, details } = req.body;

        console.log('Atualizando pedido com ID:', id); // Log de depuração
        console.log('Dados do pedido:', req.body); // Log de depuração

        const updatedOrder = await pool.query(
            'UPDATE orders SET user_id = $1, product_id = $2, status = $3, total_price = $4, payment_method = $5, details = $6 WHERE id = $7 RETURNING *',
            [user_id, product_id, status, total_price, payment_method, details, id]
        );

        console.log('Pedido atualizado:', updatedOrder.rows[0]); // Log de depuração

        res.json(updatedOrder.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});


// Rota para deletar um pedido (protegida)
app.delete('/orders/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Tentando deletar pedido com ID:', id); // Log de depuração

        await pool.query('DELETE FROM orders WHERE id = $1', [id]);

        console.log('Pedido deletado com sucesso'); // Log de depuração

        res.send('Pedido deletado com sucesso');
    } catch (err) {
        console.error('Erro ao deletar pedido:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
