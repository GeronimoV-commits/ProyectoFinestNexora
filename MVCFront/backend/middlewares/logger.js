// Middleware global que mide cuánto tarda en completarse cada solicitud HTTP.
const logger = (req, res, next) =>{
    // Guarda el instante de inicio para calcular la duración al finalizar.
    const inicio = Date.now();

    // "finish" ocurre cuando Express ya terminó de enviar la respuesta.
    res.on("finish", ()=>{
        const tiempo = Date.now() - inicio;
        console.log(`
            ${req.method} ${req.originalUrl} - ${res.statusCode} - ${tiempo}ms
            `);
    });
    // El registro no bloquea la solicitud: deja que continúe por la aplicación.
    next();
};

// app.js instala este middleware para todas las rutas.
module.exports = logger;