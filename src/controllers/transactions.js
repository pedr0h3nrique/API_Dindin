const { query } = require('../conection');

const listarTransacoes = async (req, res) => {
    const { usuario } = req;
    const { filtro } = query;

    if (filtro && !Array.isArray(filtro)) {
        return res.status(400).json({ mensagem: 'O filtro precisa ser um array' });
    }

    try {
       let queryLike = '';
       let arrayFiltro;

       if (filtro) {
        arrayFiltro =  filtro.map((item) => '%{item}%' );
        queryLike += 'AND c.descricao ilike any($2)';
        }

        const queryTransacoes = `
            SELECT t.*, c.descricao AS categoria_nome FROM transacoes t
            LEFT JOIN categorias c 
            ON t.categoria_id = c.id
            WHERE t.usuario_id = $1  
            ${queryLike}
        `;
        
        const paramFiltro = filtro ? [usuario.id, arrayFiltro] : [usuario.id];

       const transacoes = await query(queryTransacoes, paramFiltro);
        return res.json(transacoes.rows);

    } catch (error) {
        return res.status(500).json({ mensagem: `Erro interno: ${error.message}` });
    }
    
};

const detalharTransacao = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    
    try {
        const { rowCount, rows} = await query("SELECT * FROM transacoes WHERE usuario_id = $1 AND id = $2", [usuario.id, id]);
        
        if (rowCount <= 0){
            return res.status(404).json({ mensagem: 'Transação não encontrada' });
        }
        
        const [transacao] = rows;
        
        return res.status(200).json(transacao);
                             
    } catch(e) {
        return res.status(500).json({ mensagem: `Erro interno: ${error.message}` });

    }
    
};

const cadastrarTransacao = async (req, res) => {
    const { usuario } = req;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json("Todos os campos obrigatórios devem ser informados.")
    }

    if (tipo != "entrada" || tipo != "saida") {
        return res.status(400).json({ mensagen: 'O tipo precisa ser: "entrada" ou "saida"' });
    }   
    
    try {
          
        const categoria = await query('SELECT * FROM categorias WHERE id = $1', [categoria_id]);
        
        if (categoria.rowCount <= 0) {
            return res.status(404).json({ mensagem: 'A categoria não existe' });
        }
        
        const queryCadastrar = 'INSERT INTO transacoes (descricao, valor, data, categoria_id, tipo, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const paramCadastro = [descricao, valor, data, categoria_id, tipo, usuario.id];

        const { rowCount, rows } = await (queryCadastrar, paramCadastro);
        if (rowCount <= 0) {
            return res.status(500).json({ mensagem: `Erro interno: ${error.message}` });
        }

        const [transacao] = rows;
        transacao.categoria_nome = categoria.rows[0].descricao;
            
        return res.status(201).json(transacao);
            
    } catch(error) {
        return res.status(500).json({ mensagem: `Erro interno: ${error.message}` });

    }

}

const atualizarTransacao = async (req, res) => {
    const { usuario } = req;
    const { id } = req.param;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json("Todos os campos obrigatórios devem ser informados.")
    }

    if (tipo != "entrada" || tipo != "saida") {
        return res.status(400).json("Por favor, informe se o tipo de transação é uma 'entrada' ou uma 'saida'.");
    }   
    
    try {
        const transacao = await query("SELECT * FROM transacoes WHERE usuario.id = $1 AND id = $2", [usuario.id, id]);
        
        if (transacao.rowCount <= 0) {
            return res.status(404).json("Transação não econtrada")
        };
       
        const categoria = await query("SELECT * FROM categorias WHERE id = $1", [categoria_id]);
        
        if (categoria.rowCount <= 0) {
            return res.status(404).json("Categoria não encontrada");
        }

        const queryAtualizacao = "UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 WHERE id = $6";
        const paramAtualizacao = [descricao, valor, data, categoria_id, tipo, id];
        const transacaoAtualizada = await query(queryAtualizacao, paramAtualizacao);

        if (transacaoAtualizada.rowCount <= 0) {
            return res.status(500).json("Não foi possível realizar atualização.");
        }
              
        return res.status(201).send();
    
    } catch(error) {
        return res.status(500).json({ mensagem: `Erro interno: ${error.message}` });
    }        
} 

const deletarTransacao = async (req, res) => {
    const { usuario } = req;
    const { id } = req.param;

    try {
        const transacao = await query("SELECT * FROM transacoes WHERE usuario_id = $1 AND id = $2", [usuario.id, id]);
        
        if (transacao.rowCount <= 0) {
            return res.status(404).json("Transação não econtrada");      
        };
         
        const deletarTransacao = await query("DELETE FROM transacoes WHERE id = $1", [id]); 
       
        if (deletarTransacao.rowCount <= 0) {
            return res.status(500).json({ mensagem: `Erro interno: ${error.message}` });
        }    
    
        return res.status(204).send();
                    
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro interno: ${error.message}` });
    }
}

const extrato = async (req, res) => {
    const { usuario } = req;

    try {
        const queryExtrato = "SELECT sum(valor) AS saldo FROM transacoes WHERE usuario_id = $1 AND tipo = $2";
        const saldoEntrada = await query(queryExtrato, [usuario.id, 'entrada']);
        const saldoSaida = await query(queryExtrato, [usuario.id, 'saida']);
        
        return res.json({
            entrada: Number(saldoEntrada.rows[0].saldo) ?? 0,
            saida: Number(saldoSaida.rows[0].saldo) ?? 0
        });

        
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro interno: ${error.message}` });
    }
         
}

module.exports = { 
    detalharTransacao,
    listarTransacoes,
    cadastrarTransacao,
    atualizarTransacao,
    deletarTransacao,
    extrato
}