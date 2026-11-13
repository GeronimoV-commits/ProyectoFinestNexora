// URL base de la API y elementos donde se muestra el catálogo.
const URL_API = "http://localhost:3000";
const contenedorProductos = document.getElementById("lista-productos");
const mensajeCatalogo = document.getElementById("mensaje-catalogo");

// La sesión y el rol permiten presentar enlaces acordes al usuario conectado.
const token = sessionStorage.getItem("token");
const rol = sessionStorage.getItem("rol");
// Elementos de navegación que se muestran u ocultan según el estado de sesión.
const enlaceLogin = document.getElementById("enlace-login");
const enlaceAdmin = document.getElementById("enlace-admin");
const botonCerrarSesion = document.getElementById("boton-cerrar-sesion");

// Si hay token, muestra cerrar sesión y oculta el enlace de acceso.
if (token) {
    enlaceLogin.classList.add(
        "d-none"
    );
    botonCerrarSesion.classList.remove(
        "d-none"
    );
}
// El acceso al panel solo se presenta a una sesión con rol administrador.
if (
    token &&
    rol === "admin"
) {
    enlaceAdmin.classList.remove(
        "d-none"
    );
}

// Cerrar sesión elimina los datos locales y vuelve a la tienda.
botonCerrarSesion.addEventListener(
    "click",
    function () {
        sessionStorage.removeItem(
            "token"
        );
        sessionStorage.removeItem(
            "rol"
        );
        window.location.href =
            "index.html";
    }
);

// Obtiene categorías para traducir el ID de cada producto a un nombre legible.
async function obtenerCategorias() {
    const respuesta = await fetch(
        `${URL_API}/categorias`
    );
    // Un estado HTTP fallido se convierte en error para que cargarCatalogo lo maneje.
    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener las categorías"
        );
    }
    return await respuesta.json();
}



// Obtiene de la API los productos activos que se mostrarán al público.
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

// Busca en la lista el nombre asociado al ID de categoría de un producto.
function obtenerNombreCategoria(idCategoria, categorias) {
    const categoria = categorias.find(
        function (categoria) {
            return categoria.id === Number(idCategoria);
        }
    );
    if (categoria) {
        return categoria.nombre;
    }
    return "Sin categoría";
}



// Construye una tarjeta de catálogo para un producto y la devuelve lista para insertar.
function crearTarjetaProducto(producto, categorias) {

    const nombreCategoria = obtenerNombreCategoria(producto.categoria, categorias);

    // Bootstrap organiza cada tarjeta dentro de una columna responsiva.
    const columna = document.createElement('div');
    columna.className = "col-12 col-sm-6 col-lg-4";

    // La plantilla coloca los datos del producto en la tarjeta.
    columna.innerHTML = `
                <div class="card h-100 producto-card">

                    <div class="card-body d-flex flex-column">
                        <h3 class="card-title h5">${producto.nombre}</h3>
                        <p class="text-muted">Categoría: ${nombreCategoria}</p>
                        <p class="card-text">${producto.descripcion}</p>
                        <p class="fw-bold">$${producto.precio}</p>
                        <p>Stock: ${producto.stock > 0 ? `Stock: ${producto.stock}` : "Sin Stock"}</p>
                        <button class="btn btn-outline-primary mt-auto"${producto.stock <= 0 ? "disabled" : ""}>${producto.stock > 0 ? "Ver Producto" : "Sin Stock"}</button>
                    </div>
                </div>
            </div>`;

    return columna;
}

// Limpia el catálogo y renderiza una tarjeta por producto disponible.
function mostrarProductos(productos, categorias) {
    contenedorProductos.replaceChildren();
    productos.forEach(producto => {
        // Muestra un texto alternativo cuando la descripción está vacía o es null.
        if (producto.descripcion === null || producto.descripcion.trim() === "") {
            producto.descripcion = "Sin descripción";
        }
        const tarjeta = crearTarjetaProducto(producto, categorias);
        contenedorProductos.append(tarjeta);
    });
}

// Carga los datos necesarios y controla los estados vacío, correcto y error.
async function cargarCatalogo() {
    try {
        // El catálogo requiere ambos listados para mostrar el nombre de la categoría.
        const productos = await obtenerProductos();
        const categorias = await obtenerCategorias();
        // Evita mostrar una cuadrícula vacía sin explicación.
        if (productos.length === 0) {
            mensajeCatalogo.textContent =
                "No hay productos disponibles.";
            return;
        }

        // Renderiza los productos y limpia el mensaje de carga cuando hay resultados.
        mostrarProductos(productos, categorias);
        mensajeCatalogo.textContent = "";


    } catch (error) {
        // Registra el detalle técnico y presenta un mensaje de error en la página.
        console.error(error);
        mensajeCatalogo.textContent =
            "No se pudo cargar el catálogo.";
    }

}

// Ejecuta la carga inicial cuando el navegador procesa este archivo.
cargarCatalogo();
