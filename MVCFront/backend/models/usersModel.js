const db = require("../config/database");

//Crear un usuario
const crearUsuario = async (nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario, estado) => {
    if (tipo_usuario === undefined || tipo_usuario === null || tipo_usuario === "") {
        const [resultado] = await db.query(
            "INSERT INTO usuarios (nombre, apellido, contacto, email, password, imagen, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nombre, apellido, contacto, email, passwordHash, imagen, estado]
        );
        return resultado.insertId;
    }

    const [resultado] = await db.query(
        "INSERT INTO usuarios (nombre, apellido, contacto, email, password, imagen, tipo_usuario, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario, estado]
    );
    return resultado.insertId;

};

//Obtener un usuario por id
const obtenerUsuarioPorId = async (id) => {
    const [resultado] = await db.query(
        "SELECT id, nombre, apellido, contacto, email, imagen, tipo_usuario FROM usuarios WHERE id = ?",
        [id]
    );
    return resultado[0];
};

//Obtener usuarios activos
const obtenerUsuariosActivos = async () => {
    const [resultado] = await db.query(
        "SELECT id, nombre, apellido, contacto, email, imagen, tipo_usuario FROM usuarios WHERE estado = 1"
    );
    return resultado;
};

//Obtener usuarios inactivos
const obtenerUsuariosInactivos = async () => {
    const [resultado] = await db.query("SELECT id, nombre, apellido, contacto, email, imagen, tipo_usuario FROM usuarios WHERE estado = 0"
    );
    return resultado;
};

//Actualizar un usuario
const actualizarUsuario = async (id, nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario) => {
    const [resultado] = await db.query(
        "UPDATE usuarios SET nombre = ?, apellido = ?, contacto = ?, email = ?, password = COALESCE(?, password), imagen = ?, tipo_usuario = ? WHERE id = ?",
        [nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario, id]
    );
    return resultado.affectedRows > 0;
};

//Eliminar un usuario (cambiar estado a inactivo)
const eliminarUsuario = async (id) => {
    const [resultado] = await db.query(
        "UPDATE usuarios SET estado = 0 WHERE id = ?",
        [id]
    );
    return resultado.affectedRows > 0;
};

//obtener usuario por email
const obtenerUsuarioPorEmail = async (email) => {
    const [resultado] = await db.query(
        "SELECT id, nombre, apellido, contacto, email, password, imagen, tipo_usuario, estado FROM usuarios WHERE email = ?",
        [email]
    );
    return resultado[0];
};

module.exports = {
    crearUsuario,
    obtenerUsuarioPorId,
    obtenerUsuariosActivos,
    obtenerUsuariosInactivos,
    actualizarUsuario,
    eliminarUsuario,
    obtenerUsuarioPorEmail
};