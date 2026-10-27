// Importamos multer
//multer nos permite recibir archivos en el backend
const multer = require("multer");

//Importamos path, un módulo incluido en Node.js
// path nos permite trabajar con la extensión de un archivo
const path = require("path");

//******************************************** */
//CONFIGURACIÓN DE ALMACENAMIENTO
//******************************************* */
// diskStorage elegir donde lo guardo y como se llama
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        //donde va null, puede ir un error
        //el segundo parámetro es donde subo
        cb(null, "uploads/");
    },
    filename: (req, file, cb)=>{
        // obtengo extensión del archivo subido
        const extension = path.extname(file.originalname);

        const random = Math.round(Math.random() * (999999 - 1) + 1)
        const nombre = Date.now() + random + extension;

        cb(null, nombre);

    }
});

//********************************************* */
// VALIDACIÓN DEL TIPO DE ARCHIVO
//***********************************************/
const fileFilter = (req, file, cb)=>{
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const extension = tiposPermitidos.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mime = tiposPermitidos.test(file.mimetype);

    if(extension && mime){
        //acá aceptamos el archivo
        cb(null, true);
    }else{
        cb(new Error("Solo se permiten imágenes"));
    }
};

//******************************************** */
// CONFIGURACION FINAL DEL MULTER
//******************************************** */

module.exports = multer({
    storage,
    fileFilter,
    limits:{
        // 5 MB 
        // 1024 bytes = KB
        // 1024 bytes = 1 MB
        fileSize: 5 * 1024 *1024
    }
});