// Rutas de gestión de usuarios y middleware de permisos.
const express = require('express');

const router = express.Router();
const usersController = require('../controllers/usersController');
const verificarAdmin = require('../middlewares/adminMiddleware');
const verificarToken = require('../middlewares/authMiddleware');

// Los datos de cuentas solo están disponibles para administradores autenticados.
router.get('/', verificarToken, verificarAdmin, usersController.listarUsuariosActivos);
router.get('/activos', verificarToken, verificarAdmin, usersController.listarUsuariosActivos);
router.get('/inactivos', verificarToken, verificarAdmin, usersController.listarUsuariosInactivos);
router.get('/:id', verificarToken, verificarAdmin, usersController.listarUsuarioPorId);

// El registro es público, mientras que modificar o eliminar requiere administrador.
router.post('/', usersController.crearUsuario);
router.put('/:id', verificarToken, verificarAdmin, usersController.modificarUsuario);
router.delete('/:id', verificarToken, verificarAdmin, usersController.eliminarUsuario);

// app.js monta estas rutas bajo /usuarios.
module.exports = router;