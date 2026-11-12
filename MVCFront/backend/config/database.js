// Cliente MySQL con soporte de promesas para poder usar async/await en los modelos.
const mysql = require("mysql2/promise");

// Pool reutiliza conexiones en vez de abrir una conexión nueva por cada consulta.
const db = mysql.createPool({
    // Datos de conexión local; deben coincidir con la configuración de MySQL.
    host: "localhost",
    user: "root",
    password: "",
    database: "proyecto2"
});

// El resto de la aplicación importa este pool para consultar la base de datos.
module.exports = db;