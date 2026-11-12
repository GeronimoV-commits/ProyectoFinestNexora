// Referencias al formulario y al lugar donde se muestran errores de inicio de sesión.
const formulario =
    document.getElementById("form-login");
const mensaje =
    document.getElementById("mensaje-login");

// Decodifica el contenido (payload) de un JWT para leer el rol.
// La validación real de firma del token siempre corresponde al backend.
function obtenerDatosToken(token) {
    try {
        // Un JWT tiene tres partes separadas por puntos; la segunda contiene los datos.
        const payload = token.split(".")[1];
        // Base64 URL usa caracteres distintos y puede necesitar relleno "=".
        let base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        while (base64.length % 4 !== 0) {
            base64 += "=";
        }
        // Convierte el contenido Base64 a texto UTF-8 y luego a objeto JavaScript.
        const datos = JSON.parse(
            decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(function (caracter) {
                        return "%" +
                            ("00" +
                                caracter
                                    .charCodeAt(0)
                                    .toString(16)
                            ).slice(-2);
                    })
                    .join("")
            )
        );
        return datos;
    } catch (error) {
        // Un token mal formado no debe impedir que se muestre un mensaje al usuario.
        console.error(
            "No se pudo leer el token"
        );
        return null;
    }
}

// Al enviar credenciales, consulta la API y prepara la sesión del navegador.
formulario.addEventListener(
    "submit",
    async function (evento) {
        // Evita la recarga de página que normalmente realiza un formulario HTML.
        evento.preventDefault();
        // Lee los valores de los campos que el usuario completó.
        const email =
            document.getElementById(
                "email"
            ).value;
        const contraseña =
            document.getElementById(
                "contraseña"
            ).value;
        try {
            // Envía las credenciales como JSON al endpoint de autenticación.
            const respuesta = await fetch(
                "http://localhost:3000/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password: contraseña
                    })
                }
            );

            // El backend responde JSON tanto para el éxito como para los errores.
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                // Presenta el mensaje del servidor y no intenta crear la sesión.
                mensaje.textContent =
                    datos.error ||
                    datos.message ||
                    "No se pudo iniciar sesión.";
                return;
            }

            // El rol está dentro del token y se usa para mostrar opciones del panel.
            const datosToken = obtenerDatosToken(datos.token);
            const rol = datosToken?.tipo_usuario;

            if (!datos.token || !rol) {
                mensaje.textContent = "No se pudo iniciar la sesión.";
                return;
            }

            // sessionStorage mantiene la sesión en esta pestaña del navegador.
            sessionStorage.setItem("token", datos.token);
            sessionStorage.setItem("rol", rol);
            window.location.href = "index.html";
        } catch (error) {
            // Captura problemas de red o fallos al procesar la respuesta.
            console.error(error);
            mensaje.textContent =
                "No se pudo conectar con el servidor.";
        }
    }
);
