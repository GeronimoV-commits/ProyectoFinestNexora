const bcrypt = require('bcrypt');
const usersModel = require('../models/usersModel');

//Listar usuarios activos
const listarUsuariosActivos = async (req, res) => {
    try {
        const usuarios = await usersModel.obtenerUsuariosActivos();

        res.status(200).json(usuarios);

    } catch (error) {

        console.error('Error al listar usuarios activos:', error);

        res.status(500).json({ error: 'Error al listar usuarios activos' });
    }
};

//Listar usuarios inactivos
const listarUsuariosInactivos = async (req, res) => {
    try {
        const usuarios = await usersModel.obtenerUsuariosInactivos();

        res.status(200).json(usuarios);

    } catch (error) {

        console.error('Error al listar usuarios inactivos:', error);

        res.status(500).json({ error: 'Error al listar usuarios inactivos' });
    }
};

//Listar usuario por id
const listarUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await usersModel.obtenerUsuarioPorId(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);

    } catch (error) {

        console.error('Error al listar usuario por id:', error);

        res.status(500).json({ error: 'Error al listar usuario por id' });
    }
};

//Crear un usuario
const crearUsuario = async (req, res) => {
    try {
        const { nombre, apellido, contacto, email, password, tipo_usuario } = req.body;

        if (!nombre || !apellido || !contacto || !email || !password) {
            return res.status(400).json({ error: 'Nombre, Apellido, Contacto, Email y Password son campos obligatorios' });
        }

        const usuarioExistente = await usersModel.obtenerUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }

        const imagen = req.file ? req.file.filename : null;
        const passwordHash = await bcrypt.hash(password, 10);
        const id = await usersModel.crearUsuario(nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario, 1);

        return res.status(201).json({ message: 'Usuario creado exitosamente', id });
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

//modificar un usuario
const modificarUsuario = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, apellido, contacto, email, password, tipo_usuario } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        if (!nombre || !apellido || !contacto || !email) {
            return res.status(400).json({ error: 'Nombre, Apellido, Contacto y Email son campos obligatorios' });
        }

        const usuarioExistente = await usersModel.obtenerUsuarioPorId(id);

        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const usuarioConEmail = await usersModel.obtenerUsuarioPorEmail(email);
        if (usuarioConEmail && usuarioConEmail.id !== id) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }

        const imagenFinal = req.file ? req.file.filename : usuarioExistente.imagen;
        const passwordHash = password ? await bcrypt.hash(password, 10) : null;

        await usersModel.actualizarUsuario(id, nombre, apellido, contacto, email, passwordHash, imagenFinal, tipo_usuario);

        const usuarioActualizado = await usersModel.obtenerUsuarioPorId(id);

        return res.status(200).json({ message: 'Usuario modificado exitosamente', usuario: usuarioActualizado });

    } catch (error) {

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }
        console.error('Error al modificar usuario:', error);

        res.status(500).json({ error: 'Error al modificar usuario' });
    }
};

//eliminar un usuario
const eliminarUsuario = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: 'ID de usuario inválido'

            });
        }

        const eliminado = await usersModel.eliminarUsuario(id);

        if (!eliminado) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({ message: 'Usuario eliminado exitosamente' });

    } catch (error) {

        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};

module.exports = {
    listarUsuariosActivos,
    listarUsuariosInactivos,
    listarUsuarioPorId,
    crearUsuario,
    modificarUsuario,
    eliminarUsuario
};