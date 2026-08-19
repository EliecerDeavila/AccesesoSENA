const { Usuario, Rol, Acceso } = require('./src/models/index');
const sequelize = require('./src/config/db');

const seedVisitantesPrueba = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');

    // Obtener rol VISITANTE
    const visitanteRol = await Rol.findOne({ where: { nombre: 'VISITANTE' } });
    if (!visitanteRol) {
      console.error('❌ Rol VISITANTE no encontrado');
      process.exit(1);
    }

    // Obtener usuario vigilante para registrado_por
    const vigilante = await Usuario.findOne({
      where: { numero_documento: '1000000001' }
    });
    if (!vigilante) {
      console.error('❌ Usuario Vigilante no encontrado');
      process.exit(1);
    }

    // 10 visitantes ficticios
    const visitantes = [
      { numero_documento: '1010101010', tipo_documento: 'CC', nombre_completo: 'Juan Carlos Pérez', telefono_contacto: '3101234567', contacto_emergencia: '3107654321' },
      { numero_documento: '1020202020', tipo_documento: 'CC', nombre_completo: 'María Fernanda López', telefono_contacto: '3112345678', contacto_emergencia: '3118765432' },
      { numero_documento: '1030303030', tipo_documento: 'CC', nombre_completo: 'Carlos Andrés Ruiz', telefono_contacto: '3123456789', contacto_emergencia: '3129876543' },
      { numero_documento: '1040404040', tipo_documento: 'TI', nombre_completo: 'Ana Lucía Martínez', telefono_contacto: '3134567890', contacto_emergencia: '3130987654' },
      { numero_documento: '1050505050', tipo_documento: 'CC', nombre_completo: 'Pedro José García', telefono_contacto: '3145678901', contacto_emergencia: '3141098765' },
      { numero_documento: '1060606060', tipo_documento: 'CC', nombre_completo: 'Laura Valentina Rojas', telefono_contacto: '3156789012', contacto_emergencia: '3152109876' },
      { numero_documento: '1070707070', tipo_documento: 'CE', nombre_completo: 'Diego Alejandro Hernández', telefono_contacto: '3167890123', contacto_emergencia: '3163210987' },
      { numero_documento: '1080808080', tipo_documento: 'CC', nombre_completo: 'Camila Isabella Torres', telefono_contacto: '3178901234', contacto_emergencia: '3174321098' },
      { numero_documento: '1090909090', tipo_documento: 'PA', nombre_completo: 'Andrés Felipe Castro', telefono_contacto: '3189012345', contacto_emergencia: '3185432109' },
      { numero_documento: '1100000000', tipo_documento: 'CC', nombre_completo: 'Sofía Alejandra Vargas', telefono_contacto: '3190123456', contacto_emergencia: '3196543210' },
    ];

    // Crear visitantes
    const visitantesCreados = [];
    for (const v of visitantes) {
      const [usuario, created] = await Usuario.findOrCreate({
        where: { numero_documento: v.numero_documento },
        defaults: {
          ...v,
          id_rol: visitanteRol.id_rol,
          password_hash: null,
          eliminado: false
        }
      });
      visitantesCreados.push(usuario);
      if (created) {
        console.log(`  ✅ Visitante creado: ${v.nombre_completo}`);
      } else {
        console.log(`  ℹ️  Visitante ya existe: ${v.nombre_completo}`);
      }
    }

    // Accesos de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const accesos = [
      { userIdx: 0, entrada: '07:30:00', salida: '11:45:00', motivo: 'Reunión de coordinación' },
      { userIdx: 1, entrada: '08:00:00', salida: null, motivo: 'Visita académica' },
      { userIdx: 2, entrada: '08:15:00', salida: '12:30:00', motivo: 'Entrega de documentos' },
      { userIdx: 3, entrada: '08:30:00', salida: null, motivo: 'Capacitación' },
      { userIdx: 4, entrada: '09:00:00', salida: '13:15:00', motivo: 'Reunión con instructor' },
      { userIdx: 5, entrada: '09:15:00', salida: null, motivo: 'Consulta de notas' },
      { userIdx: 6, entrada: '09:30:00', salida: '14:00:00', motivo: 'Trámite administrativo' },
      { userIdx: 7, entrada: '10:00:00', salida: null, motivo: 'Prueba práctica' },
      { userIdx: 8, entrada: '10:15:00', salida: null, motivo: 'Entrega de proyecto' },
      { userIdx: 9, entrada: '10:30:00', salida: '15:00:00', motivo: 'Revisión de calificaciones' },
    ];

    console.log('\n📋 Creando accesos de hoy...');
    for (const a of accesos) {
      const visitante = visitantesCreados[a.userIdx];
      // Verificar si ya existe un acceso para este usuario hoy
      const existente = await Acceso.findOne({
        where: { id_usuario: visitante.id_usuario, fecha: hoy }
      });

      if (!existente) {
        await Acceso.create({
          id_usuario: visitante.id_usuario,
          fecha: hoy,
          hora_entrada: a.entrada,
          hora_salida: a.salida,
          motivo_visita: a.motivo,
          registrado_por: vigilante.id_usuario
        });
        const estado = a.salida ? '✅ Completado' : '🔵 En Centro';
        console.log(`  ${estado} - ${visitante.nombre_completo} (${a.entrada}${a.salida ? ' → ' + a.salida : ''})`);
      } else {
        console.log(`  ℹ️  Acceso ya existe: ${visitante.nombre_completo}`);
      }
    }

    // Resumen
    const totalEnCentro = accesos.filter(a => !a.salida).length;
    const totalCompletados = accesos.filter(a => a.salida).length;
    console.log(`\n📊 Resumen:`);
    console.log(`   - 10 visitantes creados`);
    console.log(`   - ${totalEnCentro} en centro (sin salida) → botón de salida rápida visible`);
    console.log(`   - ${totalCompletados} completados (con salida)`);
    console.log(`\n✅ Seed ejecutado correctamente`);

  } catch (error) {
    console.error('❌ Error en seed:', error.message);
  } finally {
    await sequelize.close();
  }
};

seedVisitantesPrueba();
