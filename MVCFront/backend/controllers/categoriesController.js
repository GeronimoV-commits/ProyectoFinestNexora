const categoriesModel = require('../models/categoriesModel');

//Listar categorias
const listarCategorias = async (req, res) => {
    try {
        const categorias = await categoriesModel.obtenerTodasCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al listar categorias:', error);
        res.status(500).json({ error: 'Error al listar categorias' });
    }
};

//Listar categoria por id
const listarCategoriaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await categoriesModel.obtenerCategoriaPorId(id);
        res.status(200).json(categoria);
    } catch (error) {
        console.error('Error al listar categoria por id:', error);
        res.status(500).json({ error: 'Error al listar categoria por id' });
    }
};

//listar categorias activas
const listarCategoriasActivas = async (req, res) => {
    try {
        const categorias = await categoriesModel.obtenerCategoriasActivas();
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al listar categorias activas:', error);
        res.status(500).json({ error: 'Error al listar categorias activas' });
    }
};

//listar categorias inactivas
const listarCategoriasInactivas = async (req, res) => {
    try {
        const categorias = await categoriesModel.obtenerCategoriasInactivas();
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al listar categorias inactivas:', error);
        res.status(500).json({ error: 'Error al listar categorias inactivas' });
    }
};

//Crear una categoria
const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: 'Nombre y Descripcion son campos obligatorios' });
        }
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

//Actualizar una categoria
const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: 'Nombre y Descripcion son campos obligatorios' });
        }
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

//Eliminar una categoria
const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        await categoriesModel.eliminarCategoria(id);
        res.status(200).json({ mensaje: 'Categoria eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar categoria:', error);
        res.status(500).json({ error: 'Error al eliminar categoria' });
    }
};

module.exports = {
    listarCategorias,
    listarCategoriaPorId,
    listarCategoriasActivas,
    listarCategoriasInactivas,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};