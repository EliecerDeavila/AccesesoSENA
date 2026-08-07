const { Router } = require('express');
const { listar, buscarPorDocumento, crear, actualizar, eliminar } = require('../controllers/usuarios.controller');
const auth = require('../middleware/auth');
const { soloRoles } = require('../middleware/roles');

const router = Router();

router.get('/listar', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), listar);
router.get('/documento/:numero_documento', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), buscarPorDocumento);
router.post('/', auth, soloRoles(['ADMINISTRADOR']), crear);
router.put('/:id', auth, soloRoles(['ADMINISTRADOR']), actualizar);
router.delete('/:id', auth, soloRoles(['ADMINISTRADOR']), eliminar);

module.exports = router;
