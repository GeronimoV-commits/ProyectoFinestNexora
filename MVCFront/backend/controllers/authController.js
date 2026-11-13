// bcrypt compara contraseñas y jsonwebtoken crea el token de sesión.
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersModel = require("../models/usersModel");

// Procesa el inicio de sesión y responde con los datos básicos y un token.
const login = async (req, res) => {
    try {
        // El frontend envía estas credenciales en formato JSON.
        const { email, password } = req.body;

        // No se consulta la base si falta alguno de los campos requeridos.
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y Password son campos obligatorios' });
        }
        // El modelo busca la cuenta por email; la contraseña almacenada está cifrada.
        const usuario = await usersModel.obtenerUsuarioPorEmail(email);

        // Una cuenta inexistente no puede autenticarse.
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (!usuario.estado) {
            return res.status(403).json({ error: 'La cuenta está desactivada' });
        }

        // Compara la contraseña escrita con el hash guardado sin descifrarlo.
        const passwordValido = await bcrypt.compare(password, usuario.password);

        // Rechaza una contraseña incorrecta sin crear un token.
        if (!passwordValido) {
            return res.status(401).json({ error: 'Password incorrecto' });
        }

        // El token lleva identificadores y rol; expira luego de una hora.
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario
            },
            "qwertypassword2026",
            {
                expiresIn: '1h'

            }
        );

        // Devuelve el token y solo información de usuario necesaria para el frontend.
        res.status(200).json({
            mensaje: 'Inicio de sesión correcto',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario
            }
        });
    } catch (error) {
        // Registra el detalle interno y responde con un error genérico al cliente.
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

// Permite que la ruta POST /login ejecute este controlador.
module.exports = {
    login
};