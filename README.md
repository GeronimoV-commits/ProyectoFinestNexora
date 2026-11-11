# Proyecto Finest Nexora

Tienda web realizada por alumnos de FINEST:

- Ezequiel Lucero
- Lucia Ruocco
- Geronimo Villagran

## Cómo iniciar el proyecto

Necesitás tener instalados **Node.js**, **MySQL** y la extensión **Live Server** en Visual Studio Code.

1. Iniciá MySQL y ejecutá en MySQL Workbench el archivo [`MVCFront/Script_SQL_Proyecto2.tsql`](MVCFront/Script_SQL_Proyecto2.tsql).
2. Abrí una terminal en la carpeta del proyecto e iniciá el backend:

   ```powershell
   cd MVCFront\backend
   npm install
   node app.js
   ```

3. En Visual Studio Code, abrí `MVCFront/Front/index.html` y seleccioná **Open with Live Server**.
4. La tienda se abrirá en el navegador. Dejá abierta la terminal del backend mientras la uses.

La conexión a MySQL está configurada para `localhost`, usuario `root`, contraseña vacía y base de datos `proyecto2`. Si tu instalación usa otros datos, actualizalos en [`MVCFront/backend/config/database.js`](MVCFront/backend/config/database.js).
