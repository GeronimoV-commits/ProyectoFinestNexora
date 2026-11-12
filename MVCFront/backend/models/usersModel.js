// Modelo responsable de leer y modificar registros de la tabla usuarios.
const db = require("../config/database");

// Crea una cuenta; si no se especifica el rol, MySQL aplica su valor predeterminado.
const crearUsuario = async (nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario, estado) => {
    if (tipo_usuario === undefined || tipo_usuario === null || tipo_usuario === "") {
        // Se omite tipo_usuario de la consulta para que actúe el DEFAULT de la tabla.
        const [resultado] = await db.query(
            "INSERT INTO usuarios (nombre, apellido, contacto, email, password, imagen, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nombre, apellido, contacto, email, passwordHash, imagen, estado]
        );
        return resultado.insertId;
    }

    // Si sí hay un rol, también se almacena explícitamente.
    const [resultado] = await db.query(
        "INSERT INTO usuarios (nombre, apellido, contacto, email, password, imagen, tipo_usuario, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario, estado]
    );
    return resultado.insertId;

};

// Busca un usuario y devuelve solo datos públicos, nunca el hash de contraseña.
const obtenerUsuarioPorId = async (id) => {
    const [resultado] = await db.query(
        "SELECT id, nombre, apellido, contacto, email, imagen, tipo_usuario FROM usuarios WHERE id = ?",
        [id]
    );
    return resultado[0];
};

// Lista los usuarios activos con las columnas necesarias para administración.
const obtenerUsuariosActivos = async () => {
    const [resultado] = await db.query(
        "SELECT id, nombre, apellido, contacto, email, imagen, tipo_usuario FROM usuarios WHERE estado = 1"
    );
    return resultado;
};

// Lista usuarios desactivados, también sin incluir contraseñas.
const obtenerUsuariosInactivos = async () => {
    const [resultado] = await db.query("SELECT id, nombre, apellido, contacto, email, imagen, tipo_usuario FROM usuarios WHERE estado = 0"
    );
    return resultado;
};

// Actualiza los datos de la cuenta y conserva la contraseña si no se envía un hash.
const actualizarUsuario = async (id, nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario) => {
    const [resultado] = await db.query(
        "UPDATE usuarios SET nombre = ?, apellido = ?, contacto = ?, email = ?, password = COALESCE(?, password), imagen = ?, tipo_usuario = ? WHERE id = ?",
        [nombre, apellido, contacto, email, passwordHash, imagen, tipo_usuario, id]
    );
    // Informa si la consulta modificó una fila.
    return resultado.affectedRows > 0;
};

// Desactiva la cuenta para conservar sus datos en la base.
const eliminarUsuario = async (id) => {
    const [resultado] = await db.query(
        "UPDATE usuarios SET estado = 0 WHERE id = ?",
        [id]
    );
    return resultado.affectedRows > 0;
};

// Busca por email e incluye password porque login necesita comparar el hash.
const obtenerUsuarioPorEmail = async (email) => {
    const [resultado] = await db.query(
        "SELECT id, nombre, apellido, contacto, email, password, imagen, tipo_usuario, estado FROM usuarios WHERE email = ?",
        [email]
    );
    return resultado[0];
};

// Funciones de acceso a datos disponibles para controladores.
module.exports = {
    crearUsuario,
    obtenerUsuarioPorId,
    obtenerUsuariosActivos,
    obtenerUsuariosInactivos,
    actualizarUsuario,
    eliminarUsuario,
    obtenerUsuarioPorEmail
};