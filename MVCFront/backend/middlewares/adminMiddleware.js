const usersModel = require("../models/usersModel");

const verificarAdmin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({
            mensaje: "Debe iniciar sesión para realizar esta acción"
        });
    }

    if (req.usuario.tipo_usuario !== "admin") {
        return res.status(403).json({
            mensaje: "No tiene permisos para realizar esta acción"
        });
    }

    next();
};

module.exports = verificarAdmin;