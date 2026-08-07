const { Router } = require('express');
const { reportesGenerales, reportesPorFecha, aforo } = require('../controllers/reportes.controller');
const auth = require('../middleware/auth');
const { soloRoles } = require('../middleware/roles');

const router = Router();

router.get('/', auth, soloRoles(['ADMINISTRADOR']), reportesGenerales);
router.get('/aforo', auth, soloRoles(['ADMINISTRADOR']), aforo);
router.get('/por-fecha', auth, soloRoles(['ADMINISTRADOR']), reportesPorFecha);

module.exports = router;
