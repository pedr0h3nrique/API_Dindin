const { query } = require('../conection');
const bcrypt = require('bcrypt');


const cadastrarUsuario = async(req, res) =>{
    const { nome, email, senha } = req.body;

    if(!nome || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const usuario = await query ("SELECT * FROM usuarios WHERE email = $1", [email]);
        

        if (usuario.rowCount > 0) {
            return res.status(400).json({ message: "Já existe usuário cadastrado com o e-mail informado" });
        }
        
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        
        const queryCadastrarUsuario = "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *";
        const paramCadastro = [nome, email, senhaCriptografada];
        const usuarioCadastrado = await query(queryCadastrarUsuario, paramCadastro);

        if (usuarioCadastrado.rowCount <= 0) {
            return res.status(500).json(`Erro interno: ${error.message}`);
        }
        
        const { senha: _, ...cadastro } = usuarioCadastrado.rows[0];
        
        return res.status(201).json(cadastro);    

    } catch (error) {
        return res.status(500).json(`Erro interno: ${error.message}`);
    };


};

const detalharUsuario = async (req, res) => {
    return res.json(req.usuario);
}

const atualizarUsuario = async (req, res) => {
    const { usuario } = req;
    const { nome, email, senha } = req.body;

    if(!nome || !email || !senha) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }    
    
    try {
               
        const usuarioEncontrado = await query("SELECT * FROM usuarios WHERE email = $1" [email]);
            
        if (usuarioRows > 0 && usuarioEncontrado.rows[0].id !== usuario.id ) {
            return res.status(400).json("Já existe usuário cadastrado com o e-mail informado");
        };     
        
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        
        const queryAtualizar = "UPDATE usuarios SET nome = $1, senha = $2, email = $3 WHERE id = $4";
        const paramAtualizacao = [nome, email, senhaCriptografada, usuario.id];
        const usuarioAtualizado = await query(queryAtualizar, paramAtualizacao);
        
        if (usuarioAtualizado.rowCount <= 0) {
            return res.status(500).json({mensagem: `Erro interno: ${error.message}` });
        };
              
        return res.status(204).send();
    
    } catch (error) {
        return res.status(500).json(`Erro interno: ${error.message}`);
    };    
} 

module.exports = { 
    cadastrarUsuario,
    detalharUsuario,
    atualizarUsuario,
}