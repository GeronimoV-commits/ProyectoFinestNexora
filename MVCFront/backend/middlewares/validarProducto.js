const validarProducto = (req, res, next)=>{
    const {nombre, precio, stock} = req.body;

    const precioNumero = Number(precio);
    const stockNumero = Number(stock);
    if(!nombre || !Number.isFinite(precioNumero) || !Number.isFinite(stockNumero)){
        return res.status(400).json({
            mensaje: "Nombre, precio y stock son obligatorios"
        });
    }
    if(precioNumero <= 0 ){
        return res.status(400).json({
            mensaje: "El precio tiene que ser mayor a cero"
        });
    }
    if(!Number.isInteger(stockNumero) || stockNumero < 0 || stockNumero > 2147483647){
        return res.status(400).json({
            mensaje: "El stock tiene que ser entero mayor o igual a cero"
        });
    }

    next();
};

module.exports = validarProducto;