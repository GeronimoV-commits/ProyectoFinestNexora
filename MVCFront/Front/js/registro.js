// Elementos del formulario y del mensaje de respuesta del registro.
const formulario = document.getElementById("form-registro");
const mensaje = document.getElementById("mensaje-registro");

// Procesa el envío del formulario de registro.
formulario.addEventListener("submit", async function (evento) {
    // Mantiene al usuario en la página mientras se consulta el backend.
    evento.preventDefault();

    // Recorta espacios en datos identificatorios; la contraseña se conserva literalmente.
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("contraseña").value;
    const repetirPassword = document.getElementById("repetir-contraseña").value;

    // Confirma que ambas contraseñas escritas sean iguales antes de enviar.
    if (password !== repetirPassword) {
        mensaje.textContent = "Las contraseñas no coinciden.";
        mensaje.className =
            "alert alert-danger mt-3";
        return;
    }
    // Aplica una longitud mínima básica antes de llamar a la API.
    if (password.length < 8) {
        mensaje.textContent =
            "La contraseña debe tener al menos 8 caracteres.";
        mensaje.className =
            "alert alert-danger mt-3";
        return;
    }

    // Prepara únicamente los campos que el endpoint de registro necesita.
    const registroUsuario = {
        nombre,
        apellido,
        email,
        password
    };

    try {
        // Envía los datos en JSON al endpoint público de creación de usuarios.
        const respuesta = await fetch("http://localhost:3000/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registroUsuario)
        });
        // Lee el JSON para poder presentar el mensaje del servidor.
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            // Si el backend rechaza el registro, muestra su motivo y conserva los datos.
            mensaje.textContent = datos.error || "No se pudo crear la cuenta.";
            mensaje.className =
                "alert alert-danger mt-3";
            return;
        }

        // Confirma el éxito y limpia los campos para evitar reenviar el mismo formulario.
        mensaje.textContent = "Cuenta creada correctamente. Ya puedes iniciar sesión.";
        mensaje.className =
            "alert alert-success mt-3";
        formulario.reset();
    } catch (error) {
        // Captura errores de red o problemas al procesar la respuesta del servidor.
        console.error("Error al crear la cuenta:", error);
        mensaje.textContent = "No se pudo conectar con el servidor.";
        mensaje.className =
            "alert alert-danger mt-3";
    }
});