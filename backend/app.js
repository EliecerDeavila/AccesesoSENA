const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const corsMiddleware = require('./src/middleware/cors');
require('dotenv').config();

const sequelize = require('./src/config/db');
require('./src/models/index');

const seedRoles = require('./src/utils/seedRoles');
const seedAdmin = require('./src/utils/seedAdmin');
const authRoutes = require('./src/routes/auth.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const accesosRoutes = require('./src/routes/accesos.routes');
const reportesRoutes = require('./src/routes/reportes.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(corsMiddleware());
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Demasiados intentos. Intenta de nuevo en 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/', (req, res) => {
  res.json({ message: 'API Sistema de Control de Acceso SENA' });
});

app.use('/api', loginLimiter, authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/accesos', accesosRoutes);
app.use('/api/reportes', reportesRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL conectado correctamente');

    await sequelize.sync();
    console.log('✅ Modelos sincronizados');

    await seedRoles();
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    process.exit(1);
  }
};

startServer();