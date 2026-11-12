// El modelo concentra las consultas SQL relacionadas con categorías.
const db = require("../config/database");

// Devuelve solo categorías activas para listados donde no se deben ofrecer inactivas.
const obtenerCategoriasActivas = async () => {
    const [categorias] = await db.query(`SELECT * FROM categorias WHERE estado = TRUE`);
    return categorias;
};

// Busca una categoría por su clave primaria; devuelve undefined si no existe.
const obtenerCategoriaPorId = async (id) => {
    const [categorias] = await db.execute(`SELECT * FROM categorias WHERE id = ?`, [id]);
    return categorias[0];
};

// Devuelve categorías desactivadas, por ejemplo, para tareas administrativas.
const obtenerCategoriasInactivas = async () => {
    const [categorias] = await db.query(`SELECT * FROM categorias WHERE estado = FALSE`);
    return categorias;
};

// Devuelve todas las categorías sin filtrar por estado.
const obtenerTodasCategorias = async () => {
    const [categorias] = await db.query(`SELECT * FROM categorias`);
    return categorias;
};

// Inserta una categoría nueva y devuelve sus campos más el ID generado por MySQL.
const crearCategoria = async (categoria) => {
    const { nombre, descripcion } = categoria;

    const [resultado] = await db.execute(`INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)`, [nombre, descripcion]);

    return { id: resultado.insertId, nombre, descripcion };
};

// Actualiza nombre y descripción de la categoría indicada por ID.
const actualizarCategoria = async (id, categoria) => {
    const { nombre, descripcion } = categoria;

    const [resultado] = await db.execute(`UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?`, [nombre, descripcion, id]);

    // affectedRows indica si MySQL encontró y modificó una fila.
    return resultado.affectedRows > 0;
};

// La eliminación es lógica: conserva la fila pero marca la categoría inactiva.
const eliminarCategoria = async (id) => {
    const [resultado] = await db.execute(`UPDATE categorias SET estado = FALSE WHERE id = ?`, [id]

    );

    return resultado.affectedRows > 0;
};

// Expone las operaciones que pueden utilizar los controladores.
module.exports = {
    obtenerCategoriasActivas,
    obtenerCategoriaPorId,
    obtenerCategoriasInactivas,
    obtenerTodasCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria

};