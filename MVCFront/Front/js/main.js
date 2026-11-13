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
const buscadorProductos = document.getElementById("buscador-productos");
const filtroCategoria = document.getElementById("filtro-categoria");
const botonLimpiarFiltros = document.getElementById("boton-limpiar-filtros");
const listaCarrito = document.getElementById("lista-carrito");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const botonVaciarCarrito = document.getElementById("boton-vaciar-carrito");


let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productosCargados = [];
let categoriasCargadas = [];

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

function guardarCarrito() {
    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
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

botonLimpiarFiltros.addEventListener(
    "click",
    function () {
        buscadorProductos.value = "";
        filtroCategoria.value = "";
        filtrarProductos();
    }
);

botonVaciarCarrito.addEventListener(
    "click",
    function () {
        carrito = [];
        guardarCarrito();
        actualizarCarrito();
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

function cargarFiltroCategorias(categorias) {
    categorias.forEach(
        function (categoria) {
            const opcion =
                document.createElement(
                    "option"
                );
            opcion.value = categoria.id;
            opcion.textContent = categoria.nombre;
            filtroCategoria.append(
                opcion
            );
        }
    );
}

function filtrarProductos() {
    const textoBusqueda = buscadorProductos.value.toLowerCase();
    const categoriaSeleccionada = filtroCategoria.value;
    const productosFiltrados =
        productosCargados.filter(
            function (producto) {
                const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda
                );
                const coincideDescripcion =
                    producto.descripcion
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        );
                const coincideBusqueda =
                    coincideNombre ||
                    coincideDescripcion;
                const coincideCategoria = categoriaSeleccionada === "" ||
                    producto.categoria == categoriaSeleccionada;

                return (
                    coincideBusqueda &&
                    coincideCategoria
                );
            }
        );
    if (productosFiltrados.length === 0) {
        contenedorProductos.replaceChildren();
        mensajeCatalogo.textContent =
            "No se encontraron productos.";
        return;
    }
    mensajeCatalogo.textContent = "";
    mostrarProductos(
        productosFiltrados,
        categoriasCargadas
    );
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
    const imagen = producto.imagen
        ? producto.imagen.startsWith("http") || producto.imagen.startsWith("/")
            ? producto.imagen
            : `${URL_API}/uploads/${encodeURIComponent(producto.imagen)}`
        : `https://placehold.co/600x400?text=${encodeURIComponent(producto.nombre)}`;

    // Bootstrap organiza cada tarjeta dentro de una columna responsiva.
    const columna = document.createElement('div');
    columna.className = "col-12 col-sm-6 col-lg-4";

    // La plantilla coloca los datos del producto en la tarjeta.
    columna.innerHTML = `
                <div class="card h-100 producto-card">
                    <img
                    src="${imagen}"
                    class="card-img-top imagen-producto"
                    alt="${producto.nombre}">
                    <div class="card-body d-flex flex-column">
                        <h3 class="card-title h5">${producto.nombre}</h3>
                        <p class="text-muted">Categoría: ${nombreCategoria}</p>
                        <p class="card-text">${producto.descripcion}</p>
                        <p class="fw-bold">$${producto.precio}</p>
                        <p>Stock: ${producto.stock > 0 ? `Stock: ${producto.stock}` : "Sin Stock"}</p>
                      <button class="btn btn-primary mt-auto boton-agregar"${producto.stock <= 0 ? "disabled" : ""}>
                        ${producto.stock > 0
            ? "Agregar al carrito"
            : "Sin stock"
        }
                        </button>
                            </div>
                        </div>
                    </div>`;

    const botonAgregar = columna.querySelector(".boton-agregar");

    if (producto.stock > 0) {
        botonAgregar.addEventListener(
            "click",
            function () {
                agregarAlCarrito(
                    producto
                );
            }
        );
    }

    return columna;
}

function agregarAlCarrito(producto) {
    const productoExistente =
        carrito.find(
            function (item) {
                return item.id === producto.id;
            }
        );
    if (productoExistente) {
        if (
            productoExistente.cantidad >=
            producto.stock
        ) {
            alert("No hay más unidades disponibles.");
            return;
        }
        productoExistente.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }
    guardarCarrito();
    actualizarCarrito();
}

function actualizarCarrito() {
    listaCarrito.replaceChildren();
    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
                <p class="text-muted">
                Tu carrito está vacío.
                </p>
                `;
    }
    carrito.forEach(
        function (producto) {
            const elemento = document.createElement("div");
            elemento.className = "card mb-3";
            elemento.innerHTML = `
                    <div class="card-body">
                    <h3 class="h6">${producto.nombre}</h3>
                    <p class="mb-1">
                    Precio: $${producto.precio}
                    </p>
                    <p class="mb-2">
                    Subtotal: $${producto.precio *
                producto.cantidad}
                    </p>
                    <div class="d-flex align-items-center gap-2">
                    <button
                    class="btn btn-outline-secondary btn-sm boton-restar"
                    data-id="${producto.id}">-</button>
                    <span class="badge text-bg-secondary">
                    ${producto.cantidad}
                    </span>
                    <button
                    class="btn btn-outline-secondary btn-sm boton-sumar"
                    data-id="${producto.id}">+</button>
                    <button
                    class="btn btn-outline-danger btn-sm ms-auto
                    boton-quitar"
                    data-id="${producto.id}">Quitar</button>
                    </div>
                    </div>
                    `;
            listaCarrito.append(
                elemento
            );
        }
    );
    actualizarTotales();
    conectarBotonesCarrito();
}

function actualizarTotales() {
    const cantidadTotal =
        carrito.reduce(
            function (acumulador, producto) {
                return acumulador + producto.cantidad;
            },
            0
        );
    const total =
        carrito.reduce(
            function (acumulador, producto) {
                return acumulador +
                    Number(producto.precio) *
                    producto.cantidad;
            },
            0
        );
    cantidadCarrito.textContent = cantidadTotal;
    contadorCarrito.textContent = cantidadTotal;
    totalCarrito.textContent = total;
}

function aumentarCantidad(idProducto) {
    const producto =
        carrito.find(
            function (item) {
                    return Number(item.id) === Number(idProducto);
            }
        );
    if (!producto) return;
    if (producto.cantidad >= producto.stock) {
        alert("No hay más unidades disponibles.");
        return;
    }
    producto.cantidad++;
    guardarCarrito();
    actualizarCarrito();
}

function disminuirCantidad(idProducto) {
    const producto =
        carrito.find(
            function (item) {
                    return Number(item.id) === Number(idProducto);
            }
        );
    if (!producto) return;
    producto.cantidad--;
    if (producto.cantidad <= 0) {
        quitarDelCarrito(idProducto);
        return;
    }
    guardarCarrito();
    actualizarCarrito();
}

function quitarDelCarrito(idProducto) {
    carrito =
        carrito.filter(
            function (item) {
                return item.id !== idProducto;
            }
        );
    guardarCarrito();
    actualizarCarrito();
}

function conectarBotonesCarrito() {
    const botonesSumar = listaCarrito.querySelectorAll(".boton-sumar");
    const botonesRestar = listaCarrito.querySelectorAll(".boton-restar");
    const botonesQuitar = listaCarrito.querySelectorAll(".boton-quitar");
    botonesSumar.forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const idProducto =
                        Number(boton.dataset.id);
                    aumentarCantidad(
                        idProducto
                    );
                }
            );
        }
    );
    botonesRestar.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const idProducto = Number(boton.dataset.id);
            disminuirCantidad(idProducto);
        });
    });
    botonesQuitar.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const idProducto = Number(boton.dataset.id);
            quitarDelCarrito(idProducto);
        });
    });
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
        productosCargados = productos;
        categoriasCargadas = categorias;

        cargarFiltroCategorias(categorias);
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

buscadorProductos.addEventListener("input", filtrarProductos);
filtroCategoria.addEventListener("change", filtrarProductos);

// Ejecuta la carga inicial cuando el navegador procesa este archivo.
cargarCatalogo();
actualizarCarrito();