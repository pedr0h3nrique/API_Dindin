const { query } = require('../conection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const  { email, senha } = req.body;

    if(!email || !senha) {
        return res.status(401).json({ message: 'Para fazer o login, informar email e senha' });
    }

    try{
        const { rowCount, rows }= await query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (rowCount <= 0) {
            return res.status(400).json('Email ou senha incorretos.');
        }

        const [usuario] = rows;

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaCorreta) {
            return res.status(400).json({ message: 'Email ou senha estão incorretos' });
        } 

        const token = jwt.sign({id: usuario.id}, 'senhaSecreta', { expiresIn: '8h' });
            

        const { senha: _, ...dadosUsuario } = usuario;
        
        return res.status(200).json({usuario: dadosUsuario, token});

    } catch (error){
        return res.status(500).json(`Erro interno: ${error.message}`);
    }
};



module.exports = { login };