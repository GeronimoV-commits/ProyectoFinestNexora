// Multer procesa archivos enviados mediante formularios multipart/form-data.
const multer = require("multer");

// path es un módulo integrado de Node.js que ayuda a leer la extensión del archivo.
const path = require("path");

// diskStorage define la carpeta de destino y el nombre final del archivo.
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        // El primer argumento es un error (null si no hay); el segundo es la carpeta destino.
        cb(null, "uploads/");
    },
    filename: (req, file, cb)=>{
        // Conserva la extensión para que el navegador reconozca el formato de imagen.
        const extension = path.extname(file.originalname);

        // Combina la hora actual con un número aleatorio para reducir colisiones de nombres.
        const random = Math.round(Math.random() * (999999 - 1) + 1)
        const nombre = Date.now() + random + extension;

        cb(null, nombre);

    }
});

// El filtro acepta solo formatos de imagen permitidos.
const fileFilter = (req, file, cb)=>{
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const extension = tiposPermitidos.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mime = tiposPermitidos.test(file.mimetype);

    if(extension && mime){
        // La extensión y el tipo MIME deben corresponder a un formato permitido.
        cb(null, true);
    }else{
        // Multer interrumpe la carga y comunica el error a Express.
        cb(new Error("Solo se permiten imágenes"));
    }
};

// Configuración que las rutas usan con upload.single("imagen").
module.exports = multer({
    storage,
    fileFilter,
    limits:{
        // Limita el tamaño de cada archivo a 5 MiB.
        fileSize: 5 * 1024 *1024
    }
});