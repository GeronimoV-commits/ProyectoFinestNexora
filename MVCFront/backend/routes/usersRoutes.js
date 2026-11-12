// Rutas de gestión de usuarios y middleware para recibir imágenes o validar permisos.
const express = require('express');

const router = express.Router();
const usersController = require('../controllers/usersController');
const upload = require('../middlewares/subirImagen');
const verificarAdmin = require('../middlewares/adminMiddleware');
const verificarToken = require('../middlewares/authMiddleware');

// Lecturas de usuarios; el controlador decide qué datos devolver.
router.get('/activos', usersController.listarUsuariosActivos);
router.get('/inactivos', usersController.listarUsuariosInactivos);
router.get('/:id', usersController.listarUsuarioPorId);

// El registro es público, mientras que modificar o eliminar requiere administrador.
router.post('/', upload.single('imagen'), usersController.crearUsuario);
router.put('/:id', upload.single('imagen'), verificarToken, verificarAdmin, usersController.modificarUsuario);
router.delete('/:id', verificarToken, verificarAdmin, usersController.eliminarUsuario);

// app.js monta estas rutas bajo /usuarios.
module.exports = router;