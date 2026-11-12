// Middleware que autoriza acciones reservadas a administradores.
const usersModel = require("../models/usersModel");

const verificarAdmin = (req, res, next) => {
    // verificarToken debe ejecutarse antes y colocar el usuario autenticado en req.
    if (!req.usuario) {
        return res.status(401).json({
            mensaje: "Debe iniciar sesión para realizar esta acción"
        });
    }

    // El token incluye el tipo de usuario; solo el rol admin puede continuar.
    if (req.usuario.tipo_usuario !== "admin") {
        return res.status(403).json({
            mensaje: "No tiene permisos para realizar esta acción"
        });
    }

    // Continúa con el siguiente middleware o controlador si tiene permiso.
    next();
};

// Permite que las rutas utilicen este middleware.
module.exports = verificarAdmin;