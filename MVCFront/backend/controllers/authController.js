const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersModel = require("../models/usersModel");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y Password son campos obligatorios' });
        }
        const usuario = await usersModel.obtenerUsuarioPorEmail(email);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({ error: 'Password incorrecto' });
        }

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
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

module.exports = {
    login
};