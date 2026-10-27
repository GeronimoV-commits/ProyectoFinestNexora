const db = require("../config/database");

//obtener todas las categorías Activas
const obtenerCategoriasActivas = async () => {
    const [categorias] = await db.query(`SELECT * FROM categorias WHERE estado = TRUE`);
    return categorias;
};

//obtener categoría por id
const obtenerCategoriaPorId = async (id) => {
    const [categorias] = await db.execute(`SELECT * FROM categorias WHERE id = ?`, [id]);
    return categorias[0];
};

//obtener categorias inactivas
const obtenerCategoriasInactivas = async () => {
    const [categorias] = await db.query(`SELECT * FROM categorias WHERE estado = FALSE`);
    return categorias;
};

//obtener todas las categorías
const obtenerTodasCategorias = async () => {
    const [categorias] = await db.query(`SELECT * FROM categorias`);
    return categorias;
};

//crear una categoría
const crearCategoria = async (categoria) => {
    const { nombre, descripcion } = categoria;

    const [resultado] = await db.execute(`INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)`, [nombre, descripcion]);

    return { id: resultado.insertId, nombre, descripcion };
};

//actualizar categoría
const actualizarCategoria = async (id, categoria) => {
    const { nombre, descripcion } = categoria;

    const [resultado] = await db.execute(`UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?`, [nombre, descripcion, id]);

    return resultado.affectedRows > 0;
};

//eliminar categoría
const eliminarCategoria = async (id) => {
    const [resultado] = await db.execute(`UPDATE categorias SET estado = FALSE WHERE id = ?`, [id]

    );

    return resultado.affectedRows > 0;
};

module.exports = {
    obtenerCategoriasActivas,
    obtenerCategoriaPorId,
    obtenerCategoriasInactivas,
    obtenerTodasCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria

};