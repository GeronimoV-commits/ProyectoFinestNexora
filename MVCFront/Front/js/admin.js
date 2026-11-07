const tablaProductos = document.getElementById("tabla-productos");
const tablaCategorias = document.getElementById("tabla-categorias");
const mensajeProductos = document.getElementById("mensaje-productos");
const mensajeCategorias = document.getElementById("mensaje-categorias");
const URL_API = "http://localhost:3000";
const token = sessionStorage.getItem("token");
const rol = sessionStorage.getItem("rol");
const botonNuevaCategoria = document.getElementById("boton-nueva-categoria");
const formCategoria = document.getElementById("form-categoria");
const botonNuevoProducto = document.getElementById("boton-nuevo-producto");
const formProducto = document.getElementById("form-producto");
const selectCategoria = document.getElementById("categoria-producto");

if (!token || rol !== "admin") {
    window.location.href = "index.html";
}

botonNuevaCategoria.addEventListener(
    "click",
    function () {
        formCategoria.classList.toggle(
            "d-none"
        );
    }
);

botonNuevoProducto.addEventListener(
    "click",
    function () {
        formProducto.classList.toggle(
            "d-none"
        );
    }
);



formCategoria.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();
        const nombre = document.getElementById("nombre-categoria").value;
        const descripcion = document.getElementById("descripcion-categoria").value;
        const respuesta = await fetch(
            "http://localhost:3000/categorias",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ nombre, descripcion })
            }
        );
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            alert(
                datos.message ||
                "No se pudo crear la categoría."
            );
            return;
        }

        alert("Categoría creada correctamente.");
        formCategoria.reset();
        await cargarPanel();
    });

formProducto.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();
        const nombre = document.getElementById("nombre-producto").value;
        const descripcion = document.getElementById("descripcion-producto").value;
        const precio = document.getElementById("precio-producto").value;
        const imagen = document.getElementById("imagen-producto").value;
        const stock = document.getElementById("stock-producto").value;
        const Categoria = document.getElementById("categoria-producto").value;

        const nuevoProducto = {
            nombre,
            descripcion,
            precio: Number(precio),
            imagen: imagen || null,
            stock: Number(stock),
            categoria: Number(Categoria)
        };

        if (
            Number(precio) < 0 ||
            Number(stock) < 0
        ) {
            alert(
                "Precio y/o stock no pueden ser negativos."
            );

            return;
        }
        const respuesta = await fetch(
            "http://localhost:3000/productos",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(nuevoProducto)
            });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(
                datos.message ||
                "No se pudo crear el producto."
            );
            return;
        }
        alert("Producto creado correctamente.");
        formProducto.reset();
        await cargarPanel();
    });

async function obtenerCategorias() {
    const respuesta = await fetch(
        `${URL_API}/categorias`
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
        `${URL_API}/productos`
    );
    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron obtener los productos"
        );
    }
    return await respuesta.json();
}

function mostrarProductos(productos, categorias) {

    tablaProductos.replaceChildren();

    productos.forEach(function (producto) {

        if (!producto.estado === false) { producto.estado = "Activo"; } else { producto.estado = "Inactivo"; }

        const fila = document.createElement("tr");
        const nombreCategoria = obtenerNombreCategoria(producto.categoria, categorias);

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
}

function mostrarCategorias(categorias) {

    tablaCategorias.replaceChildren();

    categorias.forEach(function (categoria) {

        if (!categoria.estado === false) { categoria.estado = "Activo"; } else { categoria.estado = "Inactivo"; }

        const fila = document.createElement("tr");

        fila.innerHTML = `
                        <td>${categoria.nombre}</td>
                        <td>${categoria.descripcion}</td>
                        <td>${categoria.estado}</td>
                        <td>
                        <button class="btn btn-warning btn-sm"
                        data-id="${categoria.id}">
                        Editar
                        </button>
                        <button class="btn btn-danger btn-sm"
                        data-id="${categoria.id}">
                        Eliminar
                        </button>
                        </td>
                        `;
        tablaCategorias.append(fila);
    });
}

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

function cargarSelectCategorias(categorias) {

    selectCategoria.replaceChildren();

    categorias.forEach(function (categoria) {

        const opcion = document.createElement("option");

        opcion.value = categoria.id;
        opcion.textContent = categoria.nombre;
        selectCategoria.append(opcion);
    });
}

async function cargarPanel() {
    try {
        const categorias = await obtenerCategorias();
        const productos = await obtenerProductos();
        mostrarProductos(productos, categorias);
        mostrarCategorias(categorias);
        cargarSelectCategorias(categorias);
        mensajeProductos.textContent = "";
        mensajeCategorias.textContent = "";
    } catch (error) {
        console.error(error);
        mensajeProductos.textContent =
            "No se pudieron cargar los productos.";
        mensajeCategorias.textContent =
            "No se pudieron cargar las categorías.";
    }
}

cargarPanel();