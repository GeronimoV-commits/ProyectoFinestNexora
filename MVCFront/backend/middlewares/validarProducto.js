// Comprueba los campos básicos de un producto antes de ejecutar el controlador.
const validarProducto = (req, res, next)=>{
    // Los datos llegan en el cuerpo de la solicitud; precio y stock suelen venir como texto.
    const {nombre, precio, stock} = req.body;

    // Convierte esos valores a número para poder validar su contenido.
    const precioNumero = Number(precio);
    const stockNumero = Number(stock);
    // Rechaza valores faltantes o que no puedan convertirse a números válidos.
    if(!nombre || !Number.isFinite(precioNumero) || !Number.isFinite(stockNumero)){
        return res.status(400).json({
            mensaje: "Nombre, precio y stock son obligatorios"
        });
    }
    // El precio debe ser positivo para poder guardar el producto.
    if(precioNumero <= 0 ){
        return res.status(400).json({
            mensaje: "El precio tiene que ser mayor a cero"
        });
    }
    // El stock debe ser entero, no negativo y caber en el tipo INT de la base de datos.
    if(!Number.isInteger(stockNumero) || stockNumero < 0 || stockNumero > 2147483647){
        return res.status(400).json({
            mensaje: "El stock tiene que ser entero mayor o igual a cero"
        });
    }

    // Si todos los controles pasan, la ruta continúa con autenticación/controlador.
    next();
};

// Permite usar este validador en las rutas POST y PUT de productos.
module.exports = validarProducto;