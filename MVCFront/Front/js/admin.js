// Referencias a elementos del HTML que se actualizan desde este archivo.
const tablaProductos = document.getElementById("tabla-productos");
const tablaCategorias = document.getElementById("tabla-categorias");
const mensajeProductos = document.getElementById("mensaje-productos");
const mensajeCategorias = document.getElementById("mensaje-categorias");

// Dirección base de la API del backend.
const URL_API = "http://localhost:3000";

// La sesión guarda estos datos al iniciar sesión y se usan para autorizar acciones.
const token = sessionStorage.getItem("token");
const rol = sessionStorage.getItem("rol");

// Botones y formularios principales del panel.
const botonNuevaCategoria = document.getElementById("boton-nueva-categoria");
const formCategoria = document.getElementById("form-categoria");
const botonNuevoProducto = document.getElementById("boton-nuevo-producto");
const formProducto = document.getElementById("form-producto");
const selectCategoria = document.getElementById("categoria-producto");

// Estos valores indican si el formulario está creando o editando un registro.
let categoriaEnEdicionId = null;
// Copia de categorías descargada del backend, usada para localizar una al editar.
let categoriasCargadas = [];
let productoEditandoId = null;

// Solo se permite permanecer en este panel a usuarios autenticados con rol admin.
if (!token || rol !== "admin") {
    window.location.href = "index.html";
}

// Al iniciar una categoría, se limpia el formulario y se descarta cualquier edición previa.
botonNuevaCategoria.addEventListener(
    "click",
    function () {
        formCategoria.reset();
        categoriaEnEdicionId = null;
        formCategoria.classList.toggle("d-none");
    }
);

// Al iniciar un producto, se limpia el formulario y se descarta cualquier edición previa.
botonNuevoProducto.addEventListener(
    "click",
    function () {
        productoEditandoId = null;
        formProducto.reset();
        formProducto.classList.toggle("d-none");
    }
);


// Guarda una categoría nueva o aplica cambios a la categoría seleccionada.
formCategoria.addEventListener(
    "submit",
    async function (evento) {

        // Evita que el navegador recargue la página al enviar el formulario.
        evento.preventDefault();

        // Lee los valores que el usuario ingresó en los campos del formulario.
        const nombre = document.getElementById("nombre-categoria").value;
        const descripcion = document.getElementById("descripcion-categoria").value;

        // El backend espera los datos de la categoría como JSON.
        const nuevaCategoria = {
            nombre,
            descripcion
        };

        // Sin ID se crea con POST; con ID se actualiza con PUT.
        let urlCategoria = `${URL_API}/categorias`;
        let metodoCategoria = "POST";

        if (categoriaEnEdicionId) {
            urlCategoria = `${URL_API}/categorias/${categoriaEnEdicionId}`;
            metodoCategoria = "PUT";
        }

        // Se envía la solicitud autenticada y se espera la respuesta del servidor.
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
        // El backend devuelve un objeto JSON con el resultado o el error.
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            // Muestra el mensaje del backend; si no viene, usa uno adecuado a la operación.
            let mensajeError = datos.error || datos.message;
            if (!mensajeError) {
                // Informa si se creó una categoría o se actualizaron sus datos.
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

        // Limpia el estado de edición para que el próximo envío cree una categoría.
        categoriaEnEdicionId = null;
        formCategoria.reset();
        formCategoria.classList.add("d-none");

        // Vuelve a descargar y mostrar los datos para reflejar el cambio guardado.
        await cargarPanel();
    });

// Guarda un producto nuevo o actualiza el producto seleccionado.
formProducto.addEventListener(
    "submit",
    async function (evento) {

        // Evita la recarga automática del navegador.
        evento.preventDefault();

        // Obtiene los valores escritos o seleccionados en el formulario.
        const nombre = document.getElementById("nombre-producto").value;
        const descripcion = document.getElementById("descripcion-producto").value;
        const precio = document.getElementById("precio-producto").value;
        const imagen = document.getElementById("imagen-producto").value;
        const stock = document.getElementById("stock-producto").value;
        const categoriaProducto = document.getElementById("categoria-producto").value;

        // Convierte los campos numéricos de texto a números antes de enviarlos.
        const nuevoProducto = {
            nombre,
            descripcion,
            precio: Number(precio),
            imagen: imagen || null,
            stock: Number(stock),
            categoria: Number(categoriaProducto)
        };

        // Evita enviar valores negativos; el backend también valida los datos.
        if (
            Number(precio) < 0 ||
            Number(stock) < 0
        ) {
            alert(
                "Precio y/o stock no pueden ser negativos."
            );

            return;
        }
        // Se usa POST para crear y PUT cuando ya se eligió un producto para editar.
        let url = `${URL_API}/productos`;
        let metodo = "POST";

        if (productoEditandoId) {
            url =
                `${URL_API}/productos/${productoEditandoId}`;
            metodo = "PUT";
        }
        // Envía el producto como JSON junto con la credencial de la sesión.
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
            // Si el servidor rechazó la operación, informa el error y no continúa.
            alert(
                datos.message ||
                "No se pudo crear el producto."
            );
            return;
        }
        // Comunica el resultado según si era una creación o una edición.
        if (productoEditandoId) {
            alert("Producto actualizado correctamente.");
        } else {
            alert("Producto creado correctamente.");
        }

        // Restablece el formulario y el estado para el siguiente producto.
        productoEditandoId = null;
        formProducto.reset();
        formProducto.classList.add("d-none");

        // Actualiza las tablas con la información que quedó guardada en el servidor.
        await cargarPanel();
    });

// Solicita al backend la lista de categorías.
async function obtenerCategorias() {

    const respuesta = await fetch(`${URL_API}/categorias`);

    // Lanza un error para que cargarPanel pueda mostrar el problema en la interfaz.
    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener las categorías"
        );
    }
    return await respuesta.json();
}

// Solicita al backend la lista de productos.
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

// Construye las filas de la tabla de productos y conecta sus botones con acciones.
function mostrarProductos(productos, categorias) {

    // Elimina filas anteriores para evitar duplicados al volver a cargar la tabla.
    tablaProductos.replaceChildren();

    // Cada producto recibido desde la API se convierte en una fila HTML.
    productos.forEach(function (producto) {

        // Convierte el estado booleano recibido a una etiqueta legible.
        if (!producto.estado === false) { producto.estado = "Activo"; } else { producto.estado = "Inactivo"; }

        const fila = document.createElement("tr");
        // El producto guarda el ID de categoría; se busca su nombre para mostrarlo.
        const nombreCategoria = obtenerNombreCategoria(producto.categoria, categorias);

        // data-id guarda el identificador que los botones necesitan al hacer clic.
        fila.innerHTML = `
                        <td>${producto.nombre}</td>
                        <td>${nombreCategoria}</td>
                        <td>$${producto.precio}</td>
                        <td>${producto.stock}</td>
                        <td>${producto.estado}</td>
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

    // Después de crear las filas, se conectan sus botones de eliminar.
    const botonesEliminarProducto =
        document.querySelectorAll(
            ".boton-eliminar-producto"
        );
    botonesEliminarProducto.forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    // dataset lee el atributo data-id; Number lo convierte a número.
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

    // Se conectan también los botones de edición de cada fila.
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

// Busca un producto por ID, carga sus datos en el formulario y activa el modo edición.
async function editarProducto(idProducto) {
    try {
        // Pide el detalle al backend porque la tabla solo contiene un resumen.
        const respuesta = await fetch(
            `${URL_API}/productos/${idProducto}`
        );
        // Si el servidor falla, se deriva al catch para avisar al usuario.
        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener el producto"
            );
        }

        // Guarda el ID: al enviar el formulario se usará para hacer un PUT.
        const producto = await respuesta.json();
        productoEditandoId = producto.id;

        // Limpia campos previos y carga en ellos los valores del producto seleccionado.
        formProducto.reset();
        document.getElementById("nombre-producto").value = producto.nombre;
        document.getElementById("descripcion-producto").value = producto.descripcion || "";
        document.getElementById("precio-producto").value = producto.precio;
        document.getElementById("imagen-producto").value = producto.imagen || "";
        document.getElementById("stock-producto").value = producto.stock;
        document.getElementById("categoria-producto").value = producto.categoria ?? "";
        // Hace visible el formulario para que el usuario pueda modificarlo.
        formProducto.classList.remove("d-none");
    } catch (error) {
        // Registra el detalle técnico en consola y muestra un mensaje comprensible.
        console.error(error);
        alert(
            "No se pudo cargar el producto."
        );
    }
}

// Desactiva un producto después de pedir confirmación al usuario.
async function eliminarProducto(idProducto) {
    const confirmar = confirm(
        "¿Seguro que deseas eliminar este producto?"
    );
    // Si se cancela, no se envía ninguna solicitud al servidor.
    if (!confirmar) {
        return;
    }
    try {
        // DELETE solicita al backend eliminar o desactivar el producto indicado.
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
        // Actualiza la tabla para quitar el producto eliminado de la vista.
        await cargarPanel();
    } catch (error) {
        // Captura errores de conexión u otros fallos durante la solicitud.
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
}

// Dibuja las categorías y prepara sus botones de editar y eliminar.
function mostrarCategorias(categorias) {

    // Limpia la tabla antes de renderizar la lista más reciente.
    tablaCategorias.replaceChildren();

    // Convierte cada categoría de la respuesta en una fila de la tabla.
    categorias.forEach(function (categoria) {

        // Presenta el estado booleano como texto para que sea entendible.
        if (!categoria.estado === false) { categoria.estado = "Activo"; } else { categoria.estado = "Inactivo"; }

        const fila = document.createElement("tr");

        // Los botones incluyen el ID en data-id para identificar la categoría elegida.
        fila.innerHTML = `
                        <td>${categoria.nombre}</td>
                        <td>${categoria.descripcion}</td>
                        <td>${categoria.estado}</td>
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
    // Se asigna a cada botón un evento que llama a la función de edición con su ID.
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
    // Se asigna a cada botón de eliminar un evento con el ID de su categoría.
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

// Encuentra una categoría en la lista cargada y rellena el formulario para editarla.
function editarCategoria(idCategoria) {
    // Se busca en la copia recibida al cargar el panel, sin hacer otra petición.
    const categoria = categoriasCargadas.find(
        function (categoria) {
            return Number(categoria.id) === Number(idCategoria);
        }
    );
    // Si el ID ya no está en la lista, se informa y se evita usar datos inexistentes.
    if (!categoria) {
        alert("No se encontró la categoría.");
        return;
    }
    // Este ID hace que el envío del formulario use PUT en vez de POST.
    categoriaEnEdicionId = categoria.id;
    document.getElementById("nombre-categoria").value = categoria.nombre;
    document.getElementById("descripcion-categoria").value = categoria.descripcion || "";
    // Muestra el formulario ya rellenado.
    formCategoria.classList.remove("d-none");
}

// Desactiva una categoría después de confirmar la acción.
async function eliminarCategoria(idCategoria) {
    const confirmar = confirm(
        "¿Seguro que deseas eliminar esta categoría?"
    );
    if (!confirmar) {
        return;
    }
    try {
        // DELETE envía al backend el ID de la categoría que se va a desactivar.
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
        // Recarga tablas y selector para reflejar los cambios.
        await cargarPanel();
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
}

// Traduce el ID de categoría asociado a un producto al nombre que verá el administrador.
function obtenerNombreCategoria(idCategoria, categorias) {

    // Los IDs pueden llegar como texto o número, por eso se normalizan a Number.
    const categoria = categorias.find(
        function (categoria) {
            return categoria.id === Number(idCategoria);
        }
    );
    if (categoria) {
        return categoria.nombre;
    }
    // Si la categoría no está disponible en la lista, se usa un texto de respaldo.
    return "Sin categoría";
}

// Llena el selector de categoría del formulario de producto.
function cargarSelectCategorias(categorias) {

    // Quita opciones antiguas antes de agregar las categorías actuales.
    selectCategoria.replaceChildren();

    // Cada opción muestra el nombre y conserva el ID como valor enviado al servidor.
    categorias.forEach(function (categoria) {

        const opcion = document.createElement("option");

        opcion.value = categoria.id;
        opcion.textContent = categoria.nombre;
        selectCategoria.append(opcion);
    });
}

// Coordina la carga inicial y las recargas posteriores de todo el panel.
async function cargarPanel() {
    try {
        // Se solicitan ambas listas antes de dibujar el contenido relacionado.
        const categorias = await obtenerCategorias();
        const productos = await obtenerProductos();
        // Guarda categorías para edición y las pasa a los componentes que las necesitan.
        categoriasCargadas = categorias;
        mostrarProductos(productos, categorias);
        mostrarCategorias(categorias);
        cargarSelectCategorias(categorias);
        // Borra los indicadores de carga/error cuando todo se obtuvo correctamente.
        mensajeProductos.textContent = "";
        mensajeCategorias.textContent = "";
    } catch (error) {
        // Si falla una petición o el renderizado, deja registro y muestra el error en pantalla.
        console.error(error);
        mensajeProductos.textContent =
            "No se pudieron cargar los productos.";
        mensajeCategorias.textContent =
            "No se pudieron cargar las categorías.";
    }
}

// Al abrir la página, obtiene del backend y presenta los datos del panel.
cargarPanel();