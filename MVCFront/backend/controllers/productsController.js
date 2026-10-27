const productsModel = require("../models/productsModel");

/*
Los controllers en la arquitectura MVC solo reciben las
peticiones y las responden, pero no tocan la base de datos.
Dejan la parte de interactuar con la base a los models
*/

//GET productos
const obtenerProductos = async (req, res) => {
    try {
        /*Acá el controller se queda esperando a que el
        model haga lo que tenga que hacer con la base y
        le devuelva un resultado al controller para responder
        la peticioón del front o el Postman */
        const productos = await productsModel.obtenerTodos();
        //acá se retorna lo que retorna el model
        res.status(200).json(productos);
    } catch (error) {
        //si lo del try se rompe, capturo y muestro error
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener productos"
        });
    }
};

/*Las explicaciones anteriores aplican a todas 
las funciones del controller */

//GET producto/id
const obtenerProductoPorId = async (req, res) => {
    try {
        //saco el id de los parámetros
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            //acá compruebo que el id sea entero
            //sino es entero, me salgo con un error
            return res.status(400).json({
                mensaje: "El ID debe ser un número entero"
            });
        }
        const producto = await productsModel.obtenerPorId(id);
        if (!producto) {
            /*me fijo que producto tenga algo después 
            de llamar al model. Si no hay nada es porque al 
            filtrar por ese id no encontró nada. Eso significaría
            que no hay un producto con el id que usa la función*/
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

//POST producto
const crearProducto = async (req, res) => {

    try {

        const { nombre, descripcion, precio, stock, categoria } = req.body;

        const imagen = req.file
            ? req.file.filename
            : null;
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        console.log({
            nombre,
            descripcion: descripcion ?? null,
            precio,
            stock,
            imagen,
            categoria,
        });

        const nuevoProducto = await productsModel.crearProducto({

            nombre,
            descripcion: descripcion ?? null,
            precio: Number(precio),
            stock: Number(stock),
            imagen,
            categoria: categoria ? Number(categoria) : null

        });

        res.status(201).json({

            mensaje: "Producto creado correctamente",
            producto: nuevoProducto

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al crear producto"
        });

    }

};

//PUT producto/id
const actualizarProducto = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número entero"
            });
        }

        const productoActual = await productsModel.obtenerPorId(id);
        if (!productoActual) {
            return res.status(404).json({
                mensaje: "El producto no fue encontrado"
            });
        }

        let descripcionFinal;
        if (descripcion !== undefined && descripcion !== null) {
            descripcionFinal = descripcion;
        } else if (productoActual.descripcion !== undefined && productoActual.descripcion !== null) {
            descripcionFinal = productoActual.descripcion;
        } else {
            descripcionFinal = null;
        }

        /* En filasModificadas voy a tener el número de
        filas que se modificaron con esta función del model */
        await productsModel.actualizarProducto(id, {
            nombre,
            descripcion: descripcionFinal,
            precio: Number(precio),
            stock: Number(stock),
            imagen: req.file ? req.file.filename : productoActual.imagen,
            categoria: categoria ? Number(categoria) : null
        });

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

//DELETE /productos/:id
const eliminarProducto = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número entero"
            });
        }
        const filasEliminadas = await productsModel.eliminar(id);
        //acá pasa lo mismo que con filasModificadas
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

//exporto para que el archivo de rutas pueda usar las funciones de acá
//si no exporto, el archivo de rutas no tiene acceso
module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
}