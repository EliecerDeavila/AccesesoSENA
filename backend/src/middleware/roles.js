const soloRoles = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const nombreRol = req.usuario.rol;

    if (!rolesPermitidos.includes(nombreRol)) {
      return res.status(403).json({
        message: `Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { soloRoles };
