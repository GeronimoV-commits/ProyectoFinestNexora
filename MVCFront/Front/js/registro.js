const formulario = document.getElementById("form-registro");
const mensaje = document.getElementById("mensaje-registro");

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("contraseña").value;
    const repetirPassword = document.getElementById("repetir-contraseña").value;

    if (password !== repetirPassword) {
        mensaje.textContent = "Las contraseñas no coinciden.";
        mensaje.className =
            "alert alert-danger mt-3";
        return;
    }
    if (password.length < 8) {
        mensaje.textContent =
            "La contraseña debe tener al menos 8 caracteres.";
        mensaje.className =
            "alert alert-danger mt-3";
        return;
    }

    const registroUsuario = {
        nombre,
        apellido,
        email,
        password
    };

    try {
        const respuesta = await fetch("http://localhost:3000/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registroUsuario)
        });
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.error || "No se pudo crear la cuenta.";
            mensaje.className =
                "alert alert-danger mt-3";
            return;
        }

        mensaje.textContent = "Cuenta creada correctamente. Ya puedes iniciar sesión.";
        mensaje.className =
            "alert alert-success mt-3";
        formulario.reset();
    } catch (error) {
        console.error("Error al crear la cuenta:", error);
        mensaje.textContent = "No se pudo conectar con el servidor.";
        mensaje.className =
            "alert alert-danger mt-3";
    }
});