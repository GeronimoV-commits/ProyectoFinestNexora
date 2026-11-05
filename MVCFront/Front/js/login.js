const formulario =
    document.getElementById("form-login");
const mensaje =
    document.getElementById("mensaje-login");

function obtenerDatosToken(token) {
    try {
        const payload = token.split(".")[1];
        let base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        while (base64.length % 4 !== 0) {
            base64 += "=";
        }
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
        console.error(
            "No se pudo leer el token"
        );
        return null;
    }
}
formulario.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();
        const email =
            document.getElementById(
                "email"
            ).value;
        const contraseña =
            document.getElementById(
                "contraseña"
            ).value;
        try {
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

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                mensaje.textContent =
                    datos.error ||
                    datos.message ||
                    "No se pudo iniciar sesión.";
                return;
            }

            const datosToken = obtenerDatosToken(datos.token);
            const rol = datosToken?.tipo_usuario;

            if (!datos.token || !rol) {
                mensaje.textContent = "No se pudo iniciar la sesión.";
                return;
            }

            sessionStorage.setItem("token", datos.token);
            sessionStorage.setItem("rol", rol);
            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
            mensaje.textContent =
                "No se pudo conectar con el servidor.";
        }
    }
);
