const { query } = require('../conection');
const jwt = require('jsonwebtoken');

const verificaLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({message: "Não autorizado." });

    }

    try {
        const token = authorization.replace('Bearer ', '').trim();
        
        const { id } = jwt.verify(token, 'senhaSecreta');

        const { rowCount, rows }= await query("SELECT * FROM usuarios WHERE id = $1" [id]);

        if (rowCount <= 0) {
            return res.status(401).json("Não autorizado.");
        }
        
              
        const [usuario] = rows;
        
        const { senha: _, ...dadosUsuario } = usuario;

        req.usuario = dadosUsuario;

        next();

    } catch (error) {
        return res.status(500).json(error.message);
    }
}

module.exports = { verificaLogin };