// Express crea el servidor HTTP y cors permite que el frontend (otro origen) consulte la API.
const express = require("express");
const cors = require("cors");
const app = express();

// Cada archivo de rutas agrupa los endpoints de una parte del sistema.
const productsRoutes = require("./routes/productsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const authRoutes = require("./routes/authRoutes");
const logger = require("./middlewares/logger");

// Convierte cuerpos JSON entrantes en req.body para que los controladores los puedan leer.
app.use(express.json());

// Registra en consola el método, URL, estado HTTP y duración de cada solicitud.
app.use(logger);

// Habilita solicitudes del navegador desde el frontend.
app.use(cors());

// Publica las imágenes guardadas en uploads mediante una URL HTTP.
app.use('/uploads', express.static('uploads'));


// Endpoint sencillo para comprobar que el servidor está activo.
app.get("/", (req, res)=>{
    res.send("API Backend II");
});

// Asocia cada prefijo de URL con su conjunto de rutas.
app.use("/productos", productsRoutes);

app.use("/usuarios", usersRoutes);

app.use("/categorias", categoriesRoutes);

app.use("/login", authRoutes);

// Puerto local donde escucha la API.
const PORT = 3000;

// Inicia el servidor y confirma la dirección en la consola.
app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});