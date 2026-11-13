const productsModel = require("../models/productsModel");

/*
En MVC, el controlador coordina HTTP y reglas de la operación.
El modelo es quien consulta o modifica la base de datos.
*/

// GET /productos: devuelve todos los productos activos.
const obtenerProductos = async (req, res) => {
    try {
        // Espera el resultado del modelo y lo convierte en una respuesta JSON.
        const productos = await productsModel.obtenerTodos();
        res.status(200).json(productos);
    } catch (error) {
        // Registra el error técnico y devuelve un mensaje general al cliente.
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener productos"
        });
    }
};

// GET /productos/:id: valida el ID y devuelve el producto encontrado.
const obtenerProductoPorId = async (req, res) => {
    try {
        // Los parámetros de la URL llegan como texto; se convierten a número.
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número entero"
            });
        }
        const producto = await productsModel.obtenerPorId(id);
        if (!producto) {
            return res.status(404).json({
                mensaje: "No existe producto con ese ID"
            });
        }
        res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error en el servidor"
        });
    }
};

// POST /productos: guarda los campos del producto.
const crearProducto = async (req, res) => {

    try {

        // Los campos de texto/número llegan en req.body.
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        if (!nombre || !precio || !stock) {
            return res.status(400).json({
                mensaje: "Nombre, precio y stock son campos obligatorios"
            });
        }
        if (isNaN(precio) || isNaN(stock)) {
            return res.status(400).json({
                mensaje: "Precio y stock deben ser números"
            });
        }

        // Normaliza los valores antes de entregarlos al modelo.
        const nuevoProducto = await productsModel.crearProducto({

            nombre,
            descripcion: descripcion ?? null,
            precio: Number(precio),
            stock: Number(stock),
            categoria: categoria ? Number(categoria) : null

        });

        // 201 informa que el producto fue creado con éxito.
        res.status(201).json({

            mensaje: "Producto creado correctamente",
            producto: nuevoProducto

        });

    } catch (error) {
        // Los errores inesperados se registran en el servidor.
        console.error(error);

        res.status(500).json({
            mensaje: "Error al crear producto"
        });

    }

};

// PUT /productos/:id: actualiza los campos de un producto existente.
const actualizarProducto = async (req, res) => {
    try {
        // Valida el ID antes de buscar o modificar registros.
        const id = Number(req.params.id);
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número entero"
            });
        }

        // Se necesita el registro actual para conservar los valores no reemplazados.
        const productoActual = await productsModel.obtenerPorId(id);
        if (!productoActual) {
            return res.status(404).json({
                mensaje: "El producto no fue encontrado"
            });
        }

        // Si no llegó descripción, conserva la ya guardada (o null si no había).
        let descripcionFinal;
        if (descripcion !== undefined && descripcion !== null) {
            descripcionFinal = descripcion;
        } else if (productoActual.descripcion !== undefined && productoActual.descripcion !== null) {
            descripcionFinal = productoActual.descripcion;
        } else {
            descripcionFinal = null;
        }

        await productsModel.actualizarProducto(id, {
            nombre,
            descripcion: descripcionFinal,
            precio: Number(precio),
            stock: Number(stock),
            categoria: categoria ? Number(categoria) : null
        });

        // Vuelve a consultar para responder con el registro actualizado.
        const productoActualizado = await productsModel.obtenerPorId(id);
        return res.status(200).json({
            mensaje: "Producto actualizado correctamente",
            producto: productoActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al actualizar producto"
        });
    }
};

// DELETE /productos/:id: el modelo realiza una eliminación lógica por estado.
const eliminarProducto = async (req, res) => {
    try {
        // Un ID inválido no debe convertirse en una consulta a la base.
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número entero"
            });
        }
        // El modelo devuelve true/false según si encontró una fila que actualizar.
        const filasEliminadas = await productsModel.eliminar(id);
        if (filasEliminadas === 0) {
            return res.status(404).json({
                mensaje: "El producto no fue encontrado"
            });
        }
        res.status(200).json({
            mensaje: "El producto fue eliminado"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al eliminar producto"
        });
    }
};

// Las rutas enlazan cada método HTTP con su función correspondiente.
module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
}