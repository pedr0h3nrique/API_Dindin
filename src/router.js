const express = require('express');
const {listarCategorias} = require('./controllers/categoria');
const  { login }  = require('./controllers/login');
const {cadastrarUsuario, 
    detalharUsuario, 
    atualizarUsuario} = require('./controllers/users');
const {listarTransacoes, 
    detalharTransacao, 
    cadastrarTransacao, 
    atualizarTransacao, 
    deletarTransacao, 
    extrato} = require('./controllers/transactions');

const  { verificaLogin }  = require('./filters/verify_login');

const router = express();

router.post('/usuario', cadastrarUsuario);
router.post('/login', login);

router.use(verificaLogin);

router.get('/usuario', detalharUsuario);
router.put('/usuario', atualizarUsuario);

router.get('/categoria', listarCategorias);

router.get('/transacao', listarTransacoes);
router.get('/transacao/extrato', extrato)
router.get('/transacao/:id', detalharTransacao);
router.post('/transacao', cadastrarTransacao);
router.put('transacao/:id', atualizarTransacao);
router.delete('transacao/:id', deletarTransacao);


module.exports = router;