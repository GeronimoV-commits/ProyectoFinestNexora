const express = require('express');

const router = express.Router();
const usersController = require('../controllers/usersController');
const upload = require('../middlewares/subirImagen');
const verificarAdmin = require('../middlewares/adminMiddleware');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/activos', usersController.listarUsuariosActivos);
router.get('/inactivos', usersController.listarUsuariosInactivos);
router.get('/:id', usersController.listarUsuarioPorId);
router.post('/', upload.single('imagen'), usersController.crearUsuario);
router.put('/:id', upload.single('imagen'), verificarToken, verificarAdmin, usersController.modificarUsuario);
router.delete('/:id', verificarToken, verificarAdmin, usersController.eliminarUsuario);

module.exports = router;