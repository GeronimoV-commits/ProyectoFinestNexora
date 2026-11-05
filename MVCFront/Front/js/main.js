const URL_API = "http://localhost:8080/api/productos";
const contenedorProductos = document.getElementById("lista-productos");
const mensajeCatalogo = document.getElementById("mensaje-catalogo");

const token =
    sessionStorage.getItem("token");
const rol =
    sessionStorage.getItem("rol");
const enlaceLogin =
    document.getElementById("enlace-login");
const enlaceAdmin =
    document.getElementById("enlace-admin");
const botonCerrarSesion =
    document.getElementById("boton-cerrar-sesion");

if (token) {
    enlaceLogin.classList.add(
        "d-none"
    );
    botonCerrarSesion.classList.remove(
        "d-none"
    );
}
if (
    token &&
    rol === "admin"
) {
    enlaceAdmin.classList.remove(
        "d-none"
    );
}

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

async function obtenerCategorias() {
    const respuesta = await fetch(
        "http://localhost:3000/categorias"
    );
    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener las categorías"
        );
    }
    return await respuesta.json();
}



async function obtenerProductos() {
    const respuesta = await fetch(
        "http://localhost:3000/productos"
    );
    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener los productos"
        );
    }
    return await respuesta.json();
}

function obtenerNombreCategoria(idCategoria, categorias) {
    const categoria = categorias.find(
        function (categoria) {
            return categoria.id === idCategoria;
        }
    );
    if (categoria) {
        return categoria.nombre;
    }
    return "Sin categoría";
}



function crearTarjetaProducto(producto, categorias) {

    const nombreCategoria = obtenerNombreCategoria(producto.id_categoria, categorias);

    const columna = document.createElement('div');
    columna.className = "col-12 col-sm-6 col-lg-4";

    columna.innerHTML = `
                <div class="card h-100 producto-card">

                    <img src="${producto.imagen || "https://placehold.co/600x400?text=Sin+imagen"}" 
                    "class="card-img-top imagen-producto"
                    alt="${producto.nombre}">

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

function mostrarProductos(productos, categorias) {
    contenedorProductos.replaceChildren();
    contenedorProductos.innerHTML = "";
    productos.forEach(producto => {
        const tarjeta = crearTarjetaProducto(producto, categorias);
        contenedorProductos.append(tarjeta);
    });
}

async function cargarCatalogo() {
    try {
        const productos =
            await obtenerProductos();
        const categorias =
            await obtenerCategorias();
        if (productos.length === 0) {
            mensajeCatalogo.textContent =
                "No hay productos disponibles.";
            return;
        }

        mostrarProductos(productos, categorias);
        mensajeCatalogo.textContent = "";


    } catch (error) {
        console.error(error);
        mensajeCatalogo.textContent =
            "No se pudo cargar el catálogo.";
    }

}


cargarCatalogo();

