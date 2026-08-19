const { Router } = require('express');
const { reportesGenerales, reportesPorFecha, aforo } = require('../controllers/reportes.controller');
const auth = require('../middleware/auth');
const { soloRoles } = require('../middleware/roles');

const router = Router();

router.get('/', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), reportesGenerales);
router.get('/aforo', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), aforo);
router.get('/por-fecha', auth, soloRoles(['ADMINISTRADOR', 'VIGILANTE']), reportesPorFecha);

module.exports = router;
