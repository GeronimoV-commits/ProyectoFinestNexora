// Express Router agrupa los endpoints de autenticación.
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /login recibe email y contraseña y delega su validación al controlador.
router.post('/', authController.login);

// app.js monta este router bajo el prefijo /login.
module.exports = router;