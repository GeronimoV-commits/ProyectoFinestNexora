const express = require('express');

const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const verificarAdmin = require('../middlewares/adminMiddleware');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/activas', categoriesController.listarCategoriasActivas);
router.get('/inactivas', categoriesController.listarCategoriasInactivas);
router.get('/:id', categoriesController.listarCategoriaPorId);
router.get('/', categoriesController.listarCategorias);
router.post('/', verificarToken, verificarAdmin, categoriesController.crearCategoria);
router.put('/:id', verificarToken, verificarAdmin, categoriesController.actualizarCategoria);
router.delete('/:id', verificarToken, verificarAdmin, categoriesController.eliminarCategoria);

module.exports = router;