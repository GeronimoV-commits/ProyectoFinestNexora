// Guardamos los elementos de la página que este archivo necesita actualizar.
const tablaProductos = document.getElementById("tabla-productos");
const tablaCategorias = document.getElementById("tabla-categorias");
const mensajeProductos = document.getElementById("mensaje-productos");
const mensajeCategorias = document.getElementById("mensaje-categorias");

// Dirección base del servidor; las rutas de productos, categorías y usuarios parten de aquí.
const URL_API = "http://localhost:3000";

// El login guarda el token y el rol en sessionStorage. El token identifica la sesión ante la API.
const token = sessionStorage.getItem("token");
const rol = sessionStorage.getItem("rol");

// Elementos del panel que usamos para abrir y procesar los formularios.
const botonNuevaCategoria = document.getElementById("boton-nueva-categoria");
const formCategoria = document.getElementById("form-categoria");
const botonNuevoProducto = document.getElementById("boton-nuevo-producto");
const formProducto = document.getElementById("form-producto");
const selectCategoria = document.getElementById("categoria-producto");
const tablaUsuarios = document.getElementById("tabla-usuarios");
const mensajeUsuarios = document.getElementById("mensaje-usuarios");
const formUsuario = document.getElementById("form-usuario");
const nombreUsuario = document.getElementById("nombre-usuario");
const emailUsuario = document.getElementById("email-usuario");
const rolUsuario = document.getElementById("rol-usuario");
const botonCancelarUsuario = document.getElementById("boton-cancelar-usuario");

// Si un ID tiene valor, el formulario está editando ese registro; null significa que crea uno nuevo.
let categoriaEnEdicionId = null;
// Guardamos las categorías recibidas para encontrar sus datos cuando se pulsa «Editar».
let categoriasCargadas = [];
let productoEditandoId = null;
let usuarioEditandoId = null;

// Esta comprobación oculta el panel a otros roles; la API también verifica los permisos.
if (!token || rol !== "admin") {
    window.location.href = "index.html";
}

// Al pulsar «Nuevo producto», dejamos el formulario vacío y salimos del modo de edición.
botonNuevoProducto.addEventListener(
    "click",
    function () {
        productoEditandoId = null;
        formProducto.reset();
        formProducto.classList.toggle("d-none");
    }
);

// Envía el formulario para crear un producto o guardar los cambios de uno existente.
formProducto.addEventListener(
    "submit",
    async function (evento) {

        // Evita la recarga normal del navegador para poder enviar los datos con fetch.
        evento.preventDefault();

        // Lee los valores que se escribieron o seleccionaron en el formulario.
        const nombre = document.getElementById("nombre-producto").value;
        const descripcion = document.getElementById("descripcion-producto").value;
        const precio = document.getElementById("precio-producto").value;
        const stock = document.getElementById("stock-producto").value;
        const categoriaProducto = document.getElementById("categoria-producto").value;

        // Prepara los datos editables del producto.
        const nuevoProducto = {
            nombre,
            descripcion,
            precio: Number(precio),
            stock: Number(stock),
            categoria: Number(categoriaProducto)
        };

        // No aceptamos precio ni stock negativos. El backend vuelve a validar estos valores.
        if (
            Number(precio) < 0 ||
            Number(stock) < 0
        ) {
            alert(
                "Precio y/o stock no pueden ser negativos."
            );

            return;
        }
        // POST crea un producto. Si hay un ID en edición, PUT actualiza ese producto.
        let url = `${URL_API}/productos`;
        let metodo = "POST";

        if (productoEditandoId) {
            url =
                `${URL_API}/productos/${productoEditandoId}`;
            metodo = "PUT";
        }
        // Enviamos los datos como JSON.
        const respuesta = await fetch(
            url,
            {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(nuevoProducto)
            });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            // Si la API rechazó los datos, mostramos el error y no limpiamos el formulario.
            alert(
                datos.message ||
                "No se pudo crear el producto."
            );
            return;
        }
        // Confirmamos si se creó un producto o se actualizaron sus datos.
        if (productoEditandoId) {
            alert("Producto actualizado correctamente.");
        } else {
            alert("Producto creado correctamente.");
        }

        // Dejamos el formulario listo para crear o editar otro producto.
        productoEditandoId = null;
        formProducto.reset();
        formProducto.classList.add("d-none");

        // Volvemos a pedir los datos para que las tablas reflejen el cambio.
        await cargarPanel();
    });

// Al pulsar «Nueva categoría», dejamos el formulario vacío y salimos del modo de edición.
botonNuevaCategoria.addEventListener(
    "click",
    function () {
        formCategoria.reset();
        categoriaEnEdicionId = null;
        formCategoria.classList.toggle("d-none");
    }
);

// Envía el formulario para crear una categoría o guardar los cambios de una existente.
formCategoria.addEventListener(
    "submit",
    async function (evento) {

        // Evita la recarga normal del navegador para poder enviar los datos con fetch.
        evento.preventDefault();

        // Lee el nombre y la descripción que se escribieron en el formulario.
        const nombre = document.getElementById("nombre-categoria").value;
        const descripcion = document.getElementById("descripcion-categoria").value;

        // Preparamos el objeto que enviaremos al backend en formato JSON.
        const nuevaCategoria = {
            nombre,
            descripcion
        };

        // POST crea una categoría. Si hay un ID en edición, PUT actualiza esa categoría.
        let urlCategoria = `${URL_API}/categorias`;
        let metodoCategoria = "POST";

        if (categoriaEnEdicionId) {
            urlCategoria = `${URL_API}/categorias/${categoriaEnEdicionId}`;
            metodoCategoria = "PUT";
        }

        // Enviamos los datos y el token de sesión, y esperamos la respuesta de la API.
        const respuesta = await fetch(
            urlCategoria,
            {
                method: metodoCategoria,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(nuevaCategoria)
            }
        );
        // Leemos la respuesta JSON para mostrar el resultado o el error que envió la API.
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            // Usamos el error de la API; si no lo hay, preparamos un mensaje según la acción.
            let mensajeError = datos.error || datos.message;
            if (!mensajeError) {
                // El mensaje depende de si intentábamos crear o editar.
                if (categoriaEnEdicionId) {
                    mensajeError = "No se pudo actualizar la categoría.";
                } else {
                    mensajeError = "No se pudo crear la categoría.";
                }
            }
            alert(mensajeError);
            return;
        }

        if (categoriaEnEdicionId) {
            alert("Categoría actualizada correctamente.");
        } else {
            alert("Categoría creada correctamente.");
        }

        // Limpiamos el ID de edición para que el próximo envío cree una categoría nueva.
        categoriaEnEdicionId = null;
        formCategoria.reset();
        formCategoria.classList.add("d-none");

        // Volvemos a pedir los datos para que la tabla muestre el cambio guardado.
        await cargarPanel();
    });

// Guarda los cambios del usuario que se está editando.
formUsuario.addEventListener(
    "submit",
    async function (evento) {
        // Evita que el navegador recargue la página al enviar el formulario.
        evento.preventDefault();
        // Sin un ID seleccionado, no hay un usuario que podamos actualizar.
        if (!usuarioEditandoId) {
            return;
        }
        // Estos son los campos del formulario que la API debe actualizar.
        const usuarioActualizado = {
            nombre: nombreUsuario.value,
            email: emailUsuario.value,
            tipo_usuario: rolUsuario.value
        };
        try {
            // PUT actualiza el usuario indicado; el token confirma que somos administradores.
            const respuesta = await fetch(
                `${URL_API}/usuarios/${usuarioEditandoId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        usuarioActualizado
                    )
                }
            );
            // La API devuelve JSON con los datos actualizados o con el motivo del error.
            const datos = await respuesta.json();
            if (!respuesta.ok) {
                alert(
                    datos.error ||
                    datos.message ||
                    "No se pudo modificar el usuario."
                );
                return;
            }
            alert(
                "Usuario modificado correctamente."
            );
            // Limpiamos el formulario y volvemos a cargar la lista actualizada.
            usuarioEditandoId = null;
            formUsuario.reset();
            formUsuario.classList.add("d-none");
            await cargarUsuarios();
        } catch (error) {
            // Este bloque se ejecuta si no se puede conectar con la API.
            console.error(error);
            alert("No se pudo conectar con el servidor.");
        }
    }
);

// Cancela la edición y descarta los cambios que todavía no se guardaron.
botonCancelarUsuario.addEventListener(
    "click",
    function () {
        usuarioEditandoId = null;
        formUsuario.reset();
        formUsuario.classList.add("d-none");
    }
);

// Pide a la API todos los productos para mostrarlos en el panel.
async function obtenerProductos() {
    const respuesta = await fetch(
        `${URL_API}/productos`
    );
    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener los productos"
        );
    }
    return await respuesta.json();
}

// Pide a la API todas las categorías para mostrarlas en el panel.
async function obtenerCategorias() {

    const respuesta = await fetch(`${URL_API}/categorias`);

    // Si la petición falla, avisamos a cargarPanel para que muestre el error en la página.
    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener las categorías"
        );
    }
    return await respuesta.json();
}

// Pide la lista de usuarios activos; la API requiere el token de administrador.
async function obtenerUsuarios() {
    const respuesta = await fetch(
        `${URL_API}/usuarios`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );
    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener los usuarios"
        );
    }
    return await respuesta.json();
}

// Conecta los botones de cada fila con las acciones de editar y eliminar.
function conectarBotonesUsuarios(usuarios) {
    const botonesEditar =
        document.querySelectorAll(
            ".boton-editar-usuario"
        );
    const botonesEliminar =
        document.querySelectorAll(
            ".boton-eliminar-usuario"
        );
    botonesEditar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                const idUsuario =
                    Number(boton.dataset.id);
                editarUsuario(idUsuario, usuarios);
            }
        );
    });

    botonesEliminar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                const idUsuario =
                    Number(boton.dataset.id);
                eliminarUsuario(
                    idUsuario
                );
            }
        );
    });
}

// Dibuja los productos en la tabla y prepara los botones de editar y eliminar.
function mostrarProductos(productos, categorias) {

    // Quitamos las filas viejas antes de dibujar la lista nueva.
    tablaProductos.replaceChildren();

    // Creamos una fila de la tabla por cada producto recibido.
    productos.forEach(function (producto) {

        const fila = document.createElement("tr");
        // El producto tiene el ID de su categoría; buscamos el nombre para mostrarlo.
        const nombreCategoria = obtenerNombreCategoria(producto.categoria, categorias);

        // Guardamos el ID en data-id para saber qué producto eligió el usuario.
        fila.innerHTML = `
                        <td>${producto.nombre}</td>
                        <td>${nombreCategoria}</td>
                        <td>$${producto.precio}</td>
                        <td>${producto.stock}</td>
                        <td>
                        <button
                        class="btn btn-warning btn-sm boton-editar-producto"
                        data-id="${producto.id}">
                        Editar
                        </button>
                        <button
                        class="btn btn-danger btn-sm boton-eliminar-producto"
                        data-id="${producto.id}">
                        Eliminar
                        </button>
                        </td>
                        `;
        tablaProductos.append(fila);
    });

    // Buscamos los botones recién creados para asignarles su acción.
    const botonesEliminarProducto = document.querySelectorAll(".boton-eliminar-producto");
    
    botonesEliminarProducto.forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    // Leemos el ID guardado en el botón y lo convertimos a número.
                    const idProducto =
                        Number(
                            boton.dataset.id
                        );
                    eliminarProducto(
                        idProducto
                    );
                }
            );
        }
    );

    // Hacemos lo mismo con los botones que abren el formulario de edición.
    const botonesEditarProducto = document.querySelectorAll(".boton-editar-producto");

    botonesEditarProducto.forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const idProducto =
                        Number(
                            boton.dataset.id
                        );
                    editarProducto(
                        idProducto
                    );
                }
            );
        }
    );
}

function mostrarCategorias(categorias) {

    // Quitamos las filas anteriores para no repetirlas al actualizar la lista.
    tablaCategorias.replaceChildren();

    // Creamos una fila de la tabla por cada categoría recibida.
    categorias.forEach(function (categoria) {

        // MySQL puede enviar el estado como 1/0; 1 significa activo.
        let estadoTexto;
        if (Number(categoria.estado) === 1) {
            estadoTexto = "Activo";
        } else {
            estadoTexto = "Inactivo";
        }

        const fila = document.createElement("tr");

        // Guardamos el ID en cada botón para identificar la categoría seleccionada.
        fila.innerHTML = `
                        <td>${categoria.nombre}</td>
                        <td>${categoria.descripcion}</td>
                        <td>${estadoTexto}</td>
                        <td>
                        <button class="btn btn-warning btn-sm boton-editar-categoria"
                        data-id="${categoria.id}">
                        Editar
                        </button>
                        <button class="btn btn-danger btn-sm boton-eliminar-categoria"
                        data-id="${categoria.id}">
                        Eliminar
                        </button>
                        </td>
                        `;
        tablaCategorias.append(fila);
    });
    // Al pulsar «Editar», buscamos la categoría por el ID guardado en el botón.
    const botonesEditarCategoria = document.querySelectorAll(".boton-editar-categoria");

    botonesEditarCategoria.forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const idCategoria =
                        Number(
                            boton.dataset.id
                        );
                    editarCategoria(
                        idCategoria
                    );
                }
            );
        }
    );
    // Al pulsar «Eliminar», enviamos a la API el ID de la categoría seleccionada.
    const botonesEliminarCategoria = document.querySelectorAll(".boton-eliminar-categoria");

    botonesEliminarCategoria.forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const idCategoria =
                        Number(
                            boton.dataset.id
                        );
                    eliminarCategoria(
                        idCategoria
                    );
                }
            );
        }
    );
}

// Dibuja la lista de usuarios y agrega un botón de acción a cada fila.
function mostrarUsuarios(usuarios) {
    tablaUsuarios.replaceChildren();
    usuarios.forEach(function (usuario) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.tipo_usuario}</td>
                <td>
                <button
                class="btn btn-warning btn-sm boton-editar-usuario"
                data-id="${usuario.id}">
                Editar
                </button>
                <button
                class="btn btn-danger btn-sm boton-eliminar-usuario"
                data-id="${usuario.id}">
                Eliminar
                </button>
                </td>
                `;
        tablaUsuarios.append(fila);
    });
    conectarBotonesUsuarios(
        usuarios
    )
}

// Pide los datos de un producto y los carga en el formulario para poder editarlo.
async function editarProducto(idProducto) {
    try {
        // La tabla muestra un resumen; pedimos a la API todos los datos de este producto.
        const respuesta = await fetch(
            `${URL_API}/productos/${idProducto}`
        );
        // Si la respuesta indica un error, catch lo captura y muestra un aviso.
        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener el producto"
            );
        }

        // Guardamos el ID para que el envío del formulario actualice este producto.
        const producto = await respuesta.json();
        productoEditandoId = producto.id;

        // Quitamos datos anteriores y rellenamos cada campo con los valores del producto.
        formProducto.reset();
        document.getElementById("nombre-producto").value = producto.nombre;
        document.getElementById("descripcion-producto").value = producto.descripcion || "";
        document.getElementById("precio-producto").value = producto.precio;
        document.getElementById("stock-producto").value = producto.stock;
        document.getElementById("categoria-producto").value = producto.categoria ?? "";
        // Mostramos el formulario ya rellenado.
        formProducto.classList.remove("d-none");
    } catch (error) {
        // Guardamos el detalle para desarrollo y mostramos un mensaje sencillo en pantalla.
        console.error(error);
        alert(
            "No se pudo cargar el producto."
        );
    }
}

function editarCategoria(idCategoria) {
    // Buscamos la categoría en la lista ya descargada; no hace falta otra petición.
    const categoria = categoriasCargadas.find(
        function (categoria) {
            return Number(categoria.id) === Number(idCategoria);
        }
    );
    // Si no encontramos la categoría, avisamos y no intentamos editar datos vacíos.
    if (!categoria) {
        alert("No se encontró la categoría.");
        return;
    }
    // Guardar este ID indica que el formulario debe actualizar una categoría existente.
    categoriaEnEdicionId = categoria.id;
    document.getElementById("nombre-categoria").value = categoria.nombre;
    document.getElementById("descripcion-categoria").value = categoria.descripcion || "";
    // Mostramos el formulario con los datos actuales para que puedan cambiarse.
    formCategoria.classList.remove("d-none");
}

// Busca el usuario elegido y carga sus datos en el formulario de edición.
function editarUsuario(idUsuario, usuarios) {
    const usuario =
        usuarios.find(function (usuario) {
            return usuario.id === idUsuario;
        });
    if (!usuario) {
        return;
    }
    usuarioEditandoId = usuario.id;
    nombreUsuario.value = usuario.nombre;
    emailUsuario.value = usuario.email;
    rolUsuario.value = usuario.tipo_usuario;
    formUsuario.classList.remove(
        "d-none"
    );
}

// Pide confirmación y luego solicita a la API desactivar el producto.
async function eliminarProducto(idProducto) {
    const confirmar = confirm(
        "¿Seguro que deseas eliminar este producto?"
    );
    // Si el usuario cancela, terminamos aquí y no hacemos cambios.
    if (!confirmar) {
        return;
    }
    try {
        // Enviamos a la API el ID del producto que se quiere desactivar.
        const respuesta = await fetch(
            `${URL_API}/productos/${idProducto}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            alert(
                datos.message ||
                "No se pudo eliminar el producto."
            );
            return;
        }
        alert(
            "Producto eliminado correctamente."
        );
        // Volvemos a cargar los datos para quitar de la tabla el producto desactivado.
        await cargarPanel();
    } catch (error) {
        // Si falla la conexión o la petición, guardamos el detalle y avisamos al usuario.
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
}

async function eliminarCategoria(idCategoria) {
    const confirmar = confirm(
        "¿Seguro que deseas eliminar esta categoría?"
    );
    if (!confirmar) {
        return;
    }
    try {
        // Enviamos a la API el ID de la categoría que se quiere desactivar.
        const respuesta = await fetch(
            `http://localhost:3000/categorias/${idCategoria}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            alert(
                datos.message ||
                "No se pudo eliminar la categoría."
            );
            return;
        }
        alert(
            "Categoría eliminada correctamente."
        );
        // Volvemos a cargar las tablas y el selector para mostrar el cambio.
        await cargarPanel();
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
}

// Pide confirmación y solicita a la API desactivar la cuenta seleccionada.
async function eliminarUsuario(idUsuario) {
    const confirmar = confirm(
        "¿Seguro que deseas eliminar este usuario?"
    );
    if (!confirmar) {
        return;
    }
    try {
        const respuesta = await fetch(
            `${URL_API}/usuarios/${idUsuario}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            alert(
                datos.error ||
                datos.message ||
                "No se pudo eliminar el usuario."
            );
            return;
        }
        alert("Usuario eliminado correctamente.");
        await cargarUsuarios();
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
}

// Busca el nombre de la categoría asociada al producto para mostrarlo en la tabla.
function obtenerNombreCategoria(idCategoria, categorias) {

    // Convertimos el ID recibido a número para compararlo con los IDs de la lista.
    const categoria = categorias.find(
        function (categoria) {
            return categoria.id === Number(idCategoria);
        }
    );
    if (categoria) {
        return categoria.nombre;
    }
    // Si no encontramos la categoría, mostramos un texto que explique que falta.
    return "Sin categoría";
}

// Agrega las categorías disponibles al selector del formulario de producto.
function cargarSelectCategorias(categorias) {

    // Borramos las opciones anteriores para evitar que se repitan.
    selectCategoria.replaceChildren();

    // El usuario ve el nombre; el formulario envía el ID que necesita la API.
    categorias.forEach(function (categoria) {

        const opcion = document.createElement("option");

        opcion.value = categoria.id;
        opcion.textContent = categoria.nombre;
        selectCategoria.append(opcion);
    });
}

// Obtiene los usuarios, actualiza la tabla y muestra un mensaje si algo falla.
async function cargarUsuarios() {
    try {
        const usuarios =
            await obtenerUsuarios();
        mostrarUsuarios(
            usuarios
        );
        mensajeUsuarios.textContent = "";
    } catch (error) {
        console.error(error);
        mensajeUsuarios.textContent =
            "No se pudieron cargar los usuarios.";
    }
}

// Pide los datos necesarios y actualiza las tablas y el selector del panel.
async function cargarPanel() {
    try {
        // Esperamos ambas respuestas antes de mostrar los productos y las categorías.
        const categorias = await obtenerCategorias();
        const productos = await obtenerProductos();
        // Guardamos las categorías para editar y para mostrar su nombre junto a cada producto.
        categoriasCargadas = categorias;
        mostrarProductos(productos, categorias);
        mostrarCategorias(categorias);
        cargarSelectCategorias(categorias);
        // Si todo salió bien, quitamos los mensajes de carga o error.
        mensajeProductos.textContent = "";
        mensajeCategorias.textContent = "";
    } catch (error) {
        // Si alguna petición falla, registramos el detalle y avisamos en la página.
        console.error(error);
        mensajeProductos.textContent =
            "No se pudieron cargar los productos.";
        mensajeCategorias.textContent =
            "No se pudieron cargar las categorías.";
    }
}

// Al abrir el panel, cargamos las tablas de productos, categorías y usuarios.
cargarPanel();
cargarUsuarios();