const express = require("express");
const cors = require("cors");
const app = express();

const productsRoutes = require("./routes/productsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const authRoutes = require("./routes/authRoutes");
const logger = require("./middlewares/logger");

//Middleware para leer json
app.use(express.json());

//middlaware global de logs
app.use(logger);

app.use(cors());

app.use('/uploads', express.static('uploads'));


//Ruta principal 
app.get("/", (req, res)=>{
    res.send("API Backend II");
});

// rutas de productos
app.use("/productos", productsRoutes);

// rutas de usuarios
app.use("/usuarios", usersRoutes);

// rutas de categorias
app.use("/categorias", categoriesRoutes);

//rutas de login
app.use("/login", authRoutes);

const PORT = 3000;

//creo un servidor con el puerto indicado
app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});