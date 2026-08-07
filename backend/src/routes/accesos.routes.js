const { Router } = require('express');
const { registrarEntrada, registrarSalida, listar, buscarPorDocumento } = require('../controllers/accesos.controller');
const auth = require('../middleware/auth');
const { soloRoles } = require('../middleware/roles');

const router = Router();

router.post('/entrada', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), registrarEntrada);
router.post('/salida', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), registrarSalida);
router.get('/', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), listar);
router.get('/usuario/:numero_documento', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), buscarPorDocumento);

module.exports = router;
