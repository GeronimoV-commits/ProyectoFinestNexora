// bcrypt protege las contraseñas; el modelo realiza las consultas a MySQL.
const bcrypt = require('bcrypt');
const usersModel = require('../models/usersModel');

// Devuelve usuarios habilitados para administración.
const listarUsuariosActivos = async (req, res) => {
    try {
        const usuarios = await usersModel.obtenerUsuariosActivos();

        res.status(200).json(usuarios);

    } catch (error) {

        console.error('Error al listar usuarios activos:', error);

        res.status(500).json({ error: 'Error al listar usuarios activos' });
    }
};

// Devuelve usuarios deshabilitados para administración.
const listarUsuariosInactivos = async (req, res) => {
    try {
        const usuarios = await usersModel.obtenerUsuariosInactivos();

        res.status(200).json(usuarios);

    } catch (error) {

        console.error('Error al listar usuarios inactivos:', error);

        res.status(500).json({ error: 'Error al listar usuarios inactivos' });
    }
};

// Busca un usuario individual por el ID incluido en la URL.
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

// Crea una cuenta nueva, verifica campos/email y guarda la contraseña como hash.
const crearUsuario = async (req, res) => {
    try {
        // Los datos del formulario se reciben en el cuerpo de la solicitud.
        const { nombre, apellido, contacto, email, password, tipo_usuario } = req.body;

        // Campos esenciales para que la cuenta pueda identificarse y autenticarse.
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ error: 'Nombre, Apellido, Email y Password son campos obligatorios' });
        }

        // Evita duplicar correos, que además tienen restricción UNIQUE en MySQL.
        const usuarioExistente = await usersModel.obtenerUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }

        // Guarda el nombre de archivo y nunca la contraseña en texto plano.
        const imagen = req.file ? req.file.filename : null;
        const passwordHash = await bcrypt.hash(password, 10);
        // El modelo inserta la cuenta y devuelve su nuevo identificador.
        const id = await usersModel.crearUsuario(
            nombre,
            apellido,
            contacto || null,
            email,
            passwordHash,
            imagen,
            tipo_usuario,
            1
        );

        return res.status(201).json({ message: 'Usuario creado exitosamente', id });
    }
    catch (error) {
        // ER_DUP_ENTRY cubre una colisión que ocurra entre la consulta y el INSERT.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

// Actualiza los datos de un usuario; contraseña e imagen son opcionales.
const modificarUsuario = async (req, res) => {
    try {
        // Valida el ID y lee los campos enviados para actualizar.
        const id = Number(req.params.id);
        const { nombre, apellido, contacto, email, password, tipo_usuario } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        if (!nombre || !apellido || !contacto || !email) {
            return res.status(400).json({ error: 'Nombre, Apellido, Contacto y Email son campos obligatorios' });
        }

        // Se obtiene el registro actual para validar existencia y conservar la imagen.
        const usuarioExistente = await usersModel.obtenerUsuarioPorId(id);

        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // El correo puede pertenecer al mismo usuario, pero no a otra cuenta.
        const usuarioConEmail = await usersModel.obtenerUsuarioPorEmail(email);
        if (usuarioConEmail && usuarioConEmail.id !== id) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }

        // Si no se envía reemplazo, se conserva la imagen actual.
        const imagenFinal = req.file ? req.file.filename : usuarioExistente.imagen;
        // Se calcula hash solo si se indicó una contraseña nueva.
        const passwordHash = password ? await bcrypt.hash(password, 10) : null;

        // COALESCE en el modelo conserva la contraseña actual cuando passwordHash es null.
        await usersModel.actualizarUsuario(id, nombre, apellido, contacto, email, passwordHash, imagenFinal, tipo_usuario);

        // Consulta otra vez para responder con los datos vigentes (sin la contraseña).
        const usuarioActualizado = await usersModel.obtenerUsuarioPorId(id);

        return res.status(200).json({ message: 'Usuario modificado exitosamente', usuario: usuarioActualizado });

    } catch (error) {

        // También detecta duplicados reportados directamente por la base de datos.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        }
        console.error('Error al modificar usuario:', error);

        res.status(500).json({ error: 'Error al modificar usuario' });
    }
};

// Desactiva un usuario en lugar de borrar físicamente sus datos.
const eliminarUsuario = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: 'ID de usuario inválido'

            });
        }

        // El modelo devuelve false si el ID no corresponde a una fila modificada.
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

// Las rutas usan estas funciones para atender cada operación de usuario.
module.exports = {
    listarUsuariosActivos,
    listarUsuariosInactivos,
    listarUsuarioPorId,
    crearUsuario,
    modificarUsuario,
    eliminarUsuario
};