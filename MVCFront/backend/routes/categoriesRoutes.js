// Router y controlador que implementan los endpoints de categorías.
const express = require('express');

const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const verificarAdmin = require('../middlewares/adminMiddleware');
const verificarToken = require('../middlewares/authMiddleware');

// Consultas de lectura: listas completas, filtradas o una categoría por ID.
router.get('/activas', categoriesController.listarCategoriasActivas);
router.get('/inactivas', categoriesController.listarCategoriasInactivas);
router.get('/:id', categoriesController.listarCategoriaPorId);
router.get('/', categoriesController.listarCategorias);

// Crear, actualizar y eliminar son operaciones administrativas:
// primero se comprueba la identidad del usuario y luego su rol.
router.post('/', verificarToken, verificarAdmin, categoriesController.crearCategoria);
router.put('/:id', verificarToken, verificarAdmin, categoriesController.actualizarCategoria);
router.delete('/:id', verificarToken, verificarAdmin, categoriesController.eliminarCategoria);

// app.js monta estas rutas bajo /categorias.
module.exports = router;