// El controlador recibe las solicitudes HTTP y delega las consultas al modelo.
const categoriesModel = require('../models/categoriesModel');

// GET /categorias: devuelve la lista completa.
const listarCategorias = async (req, res) => {
    try {
        // El modelo consulta MySQL y el controlador decide el código HTTP.
        const categorias = await categoriesModel.obtenerTodasCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        // Registra el error interno y comunica un fallo de servidor al cliente.
        console.error('Error al listar categorias:', error);
        res.status(500).json({ error: 'Error al listar categorias' });
    }
};

// GET /categorias/:id: busca una categoría específica.
const listarCategoriaPorId = async (req, res) => {
    try {
        // Express coloca los parámetros de la URL en req.params.
        const { id } = req.params;
        const categoria = await categoriesModel.obtenerCategoriaPorId(id);
        res.status(200).json(categoria);
    } catch (error) {
        console.error('Error al listar categoria por id:', error);
        res.status(500).json({ error: 'Error al listar categoria por id' });
    }
};

// GET /categorias/activas: filtra las categorías habilitadas.
const listarCategoriasActivas = async (req, res) => {
    try {
        const categorias = await categoriesModel.obtenerCategoriasActivas();
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al listar categorias activas:', error);
        res.status(500).json({ error: 'Error al listar categorias activas' });
    }
};

// GET /categorias/inactivas: devuelve categorías desactivadas.
const listarCategoriasInactivas = async (req, res) => {
    try {
        const categorias = await categoriesModel.obtenerCategoriasInactivas();
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al listar categorias inactivas:', error);
        res.status(500).json({ error: 'Error al listar categorias inactivas' });
    }
};

// POST /categorias: valida los campos y crea una categoría nueva.
const crearCategoria = async (req, res) => {
    try {
        // Extrae los campos que envió el frontend.
        const { nombre, descripcion } = req.body;
        // Si falta un campo obligatorio, responde sin consultar el modelo.
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: 'Nombre y Descripcion son campos obligatorios' });
        }
        // El modelo inserta la categoría; 201 indica que se creó un recurso.
        const nuevaCategoria = await categoriesModel.crearCategoria({ nombre, descripcion });
        res.status(201).json({
            mensaje: 'Categoria creada correctamente',
            categoria: nuevaCategoria
        });
    } catch (error) {
        console.error('Error al crear categoria:', error);
        res.status(500).json({ error: 'Error al crear categoria' });
    }
};

// PUT /categorias/:id: reemplaza el nombre y la descripción de una categoría.
const actualizarCategoria = async (req, res) => {
    try {
        // El ID identifica el registro y los valores llegan en el cuerpo JSON.
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        // Se exigen ambos campos antes de ejecutar la actualización.
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: 'Nombre y Descripcion son campos obligatorios' });
        }
        // Delega el UPDATE al modelo y devuelve el resultado al frontend.
        const categoriaActualizada = await categoriesModel.actualizarCategoria(id, { nombre, descripcion });
        res.status(200).json({
            mensaje: 'Categoria actualizada correctamente',
            categoria: categoriaActualizada
        });
    } catch (error) {
        console.error('Error al actualizar categoria:', error);
        res.status(500).json({ error: 'Error al actualizar categoria' });
    }
};

// DELETE /categorias/:id: cambia el estado de la categoría en el modelo.
const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        // La eliminación es lógica: el modelo cambia estado en lugar de borrar la fila.
        await categoriesModel.eliminarCategoria(id);
        res.status(200).json({ mensaje: 'Categoria eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar categoria:', error);
        res.status(500).json({ error: 'Error al eliminar categoria' });
    }
};

// Las rutas importan solo las funciones que necesitan para cada endpoint.
module.exports = {
    listarCategorias,
    listarCategoriaPorId,
    listarCategoriasActivas,
    listarCategoriasInactivas,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};