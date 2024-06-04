const jwt = require('jsonwebtoken');

const secretKey = '!Sql@developer10'; // Substitua por uma chave secreta forte

// Função para gerar um token JWT
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
}

// Função para verificar um token JWT
function verifyToken(token) {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        return null;
    }
}

module.exports = {
    generateToken,
    verifyToken
};
