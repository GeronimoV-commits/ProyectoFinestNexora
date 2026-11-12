// Este modelo es la capa que interactúa directamente con la tabla productos.
const db = require("../config/database");

// Devuelve productos activos para el catálogo y el panel administrativo.
const obtenerTodos = async () => {
    const [productos] = await db.query(
        `SELECT *
        FROM productos
        WHERE estado = TRUE`
    );
    return productos;
};

// Busca un producto activo por ID; devuelve undefined si no existe.
const obtenerPorId = async (id) => {
    const [productos] = await db.execute(
        `SELECT *
        FROM productos
        WHERE id = ? AND estado = TRUE`,
        [id]
    );

    return productos[0];
};

// Inserta un producto y devuelve un objeto con sus datos y el ID generado.
const crearProducto = async (producto) => {

    // Separa las propiedades para pasarlas como parámetros de la consulta SQL.
    const { nombre, descripcion = null, precio, stock, imagen, categoria } = producto;

    // Los signos ? son parámetros preparados: protegen valores y evitan concatenar SQL.
    const [resultado] = await db.execute(

        `INSERT INTO productos
        (nombre, descripcion, precio, stock, imagen, categoria)
        VALUES (?, ?, ?, ?, ?, ?)`,

        [nombre, descripcion, precio, stock, imagen, categoria]

    );

    // insertId es el identificador que MySQL asignó al nuevo producto.
    return {

        id: resultado.insertId,
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        categoria
    };

};

// Actualiza los campos de un producto existente y comunica si se afectó una fila.
const actualizarProducto = async (id, producto) => {
    const { nombre, descripcion, precio, stock, imagen, categoria } = producto;
    const [resultado] = await db.execute(
        `UPDATE productos
        SET nombre = ?, descripcion = ?, precio =?, stock =?, imagen = ?, categoria = ?
        WHERE id = ?`, [nombre, descripcion, precio, stock, imagen, categoria, id]
    );
    return resultado.affectedRows > 0;

};

// Desactiva el producto sin borrarlo físicamente, preservando referencias históricas.
const eliminar = async (id) => {
    const [resultado] = await db.execute(
        "UPDATE productos SET estado = FALSE WHERE id = ?",
        [id]
    );
    return resultado.affectedRows > 0;
};

// Exporta el acceso a datos para que lo usen los controladores.
module.exports = {
    obtenerTodos,
    obtenerPorId,
    crearProducto,
    actualizarProducto,
    eliminar
}