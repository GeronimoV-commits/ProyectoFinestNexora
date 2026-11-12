// jsonwebtoken verifica la firma y expiración de los tokens de sesión.
const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    // El navegador envía el token en el encabezado Authorization.
    const autorizationHeader = req.headers.authorization;

    // Rechaza la solicitud si no se envió el encabezado.
    if (!autorizationHeader) {
        return res.status(401).json({ error: 'Token invalido' });
    }

    // Formato esperado: "Bearer <token>"; la segunda parte contiene el token.
    const token = autorizationHeader.split(" ")[1];

    // También se rechaza un encabezado incompleto.
    if (!token) {
        return res.status(401).json({ error: 'Token invalido' });
    }

    try {
        // Comprueba firma y vigencia; los datos decodificados identifican al usuario.
        const decoded = jwt.verify(
            token,
            "qwertypassword2026"
        );

        // Los controladores y el middleware de administrador pueden consultar req.usuario.
        req.usuario = decoded;

        // La solicitud ya está autenticada, así que sigue el flujo de la ruta.
        next();

    } catch (error) {
        // Un token vencido, alterado o inválido no permite acceder a la ruta.
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Exporta el middleware para proteger endpoints.
module.exports = verificarToken;
