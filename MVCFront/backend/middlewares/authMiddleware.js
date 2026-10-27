const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    const autorizationHeader = req.headers.authorization;

    if (!autorizationHeader) {
        return res.status(401).json({ error: 'Token invalido' });
    }

    const token = autorizationHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: 'Token invalido' });
    }

    try {
        const decoded = jwt.verify(
            token,
            "qwertypassword2026"
        );

        req.usuario = decoded;

        next();

    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = verificarToken;
