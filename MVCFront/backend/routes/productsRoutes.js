const express = require("express");

const router = express.Router();
const productController = require("../controllers/productsController");
const validarProducto = require("../middlewares/validarProducto");
const verificarAdmin = require("../middlewares/adminMiddleware");
const verificarToken = require("../middlewares/authMiddleware");

const upload = require("../middlewares/subirImagen");

/*
Esto es igual que en el semestre pasado. Desde el frontend, o desde Postman
se hacen peticiones con métodos POST, GET, PUT y DELETE. Estas rutas se usan desde
el app.js y se le asigna /productos para la ruta. Si llega algo que va para 
/productos, se usan las funciones que en este archivo se asignan a cada método

*/

//obtener todos los productos
router.get("/", productController.obtenerProductos);
router.get("/:id", productController.obtenerProductoPorId);
router.post("/", upload.single("imagen"), validarProducto, verificarToken, verificarAdmin, productController.crearProducto);
router.put("/:id", upload.single("imagen"), validarProducto, verificarToken, verificarAdmin, productController.actualizarProducto);
router.delete("/:id", verificarToken, verificarAdmin, productController.eliminarProducto);

//exporto para que app.js sepa que hacer si llega 
// por ejemplo un GET a /productos 
module.exports = router;