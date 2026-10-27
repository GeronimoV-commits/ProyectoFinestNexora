const db = require("../config/database");

//Obtener todos los productos
const obtenerTodos = async () => {
    const [productos] = await db.query(
        `SELECT *
        FROM productos
        WHERE estado = TRUE`
    );
    return productos;
};

//obtener producto por id
const obtenerPorId = async (id) => {
    const [productos] = await db.execute(
        `SELECT *
        FROM productos
        WHERE id = ? AND estado = TRUE`,
        [id]
    );

    return productos[0];
};

//crear un producto
const crearProducto = async (producto) => {

    const { nombre, descripcion = null, precio, stock, imagen, categoria } = producto;

    const [resultado] = await db.execute(

        `INSERT INTO productos
        (nombre, descripcion, precio, stock, imagen, categoria)
        VALUES (?, ?, ?, ?, ?, ?)`,

        [nombre, descripcion, precio, stock, imagen, categoria]

    );

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

//actualizar producto
const actualizarProducto = async (id, producto) => {
    const { nombre, descripcion, precio, stock, imagen, categoria } = producto;
    const [resultado] = await db.execute(
        `UPDATE productos
        SET nombre = ?, descripcion = ?, precio =?, stock =?, imagen = ?, categoria = ?
        WHERE id = ?`, [nombre, descripcion, precio, stock, imagen, categoria, id]
    );
    return resultado.affectedRows > 0; //esto retorna la cantidad de filas afectadas por el update.

};

//eliminar producto
const eliminar = async (id) => {
    const [resultado] = await db.execute(
        "UPDATE productos SET estado = FALSE WHERE id = ?",
        [id]
    );
    return resultado.affectedRows > 0; //esto retorna la cantidad de filas afectadas por el update.
};

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crearProducto,
    actualizarProducto,
    eliminar
}