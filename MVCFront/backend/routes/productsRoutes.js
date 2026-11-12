// Router, controlador y middlewares necesarios para las operaciones de productos.
const express = require("express");

const router = express.Router();
const productController = require("../controllers/productsController");
const validarProducto = require("../middlewares/validarProducto");
const verificarAdmin = require("../middlewares/adminMiddleware");
const verificarToken = require("../middlewares/authMiddleware");

const upload = require("../middlewares/subirImagen");

// Lecturas públicas: lista de productos activos o detalle de uno por ID.
router.get("/", productController.obtenerProductos);
router.get("/:id", productController.obtenerProductoPorId);

// En POST y PUT, Multer procesa la imagen antes de validar el producto.
// Luego se verifica la sesión y el rol administrativo antes de modificar la base.
router.post("/", upload.single("imagen"), validarProducto, verificarToken, verificarAdmin, productController.crearProducto);
router.put("/:id", upload.single("imagen"), validarProducto, verificarToken, verificarAdmin, productController.actualizarProducto);

// DELETE también requiere una sesión válida de administrador.
router.delete("/:id", verificarToken, verificarAdmin, productController.eliminarProducto);

// app.js monta este router bajo el prefijo /productos.
module.exports = router;