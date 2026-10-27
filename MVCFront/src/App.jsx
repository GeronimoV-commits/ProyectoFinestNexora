import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000/productos'

const formularioInicial = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoria: '',
}

const normalizarProducto = (producto) => ({
  id: producto.id ?? producto.ID,
  nombre: producto.nombre ?? producto.NOMBRE ?? '',
  descripcion: producto.descripcion ?? producto.DESCRIPCION ?? '',
  precio: producto.precio ?? producto.PRECIO ?? '',
  stock: producto.stock ?? producto.STOCK ?? '',
  categoria: producto.categoria ?? producto.CATEGORIA ?? '',
})

function App() {
  const [productos, setProductos] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [imagen, setImagen] = useState(null)
  const inputImagenRef = useRef(null)
  const [editingId, setEditingId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargarProductos = async () => {
    try {
      setError('')
      const respuesta = await fetch(API_URL)
      if (!respuesta.ok) throw new Error('No se pudieron cargar los productos')
      const datos = await respuesta.json()
      setProductos(datos.map(normalizarProducto))
    } catch (errorApi) {
      setError(errorApi.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const cambiarCampo = (evento) => {
    const { name, value } = evento.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
  }

  const limpiarFormulario = () => {
    setFormulario(formularioInicial)
    setImagen(null)
    if (inputImagenRef.current) inputImagenRef.current.value = ''
    setEditingId(null)
  }

  const editarProducto = (producto) => {
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
    })
    setEditingId(producto.id)
    setMensaje('')
    setError('')
  }

  const guardarProducto = async (evento) => {
    evento.preventDefault()
    setMensaje('')
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Inicia sesión como administrador antes de crear o modificar productos.')
      return
    }

    const datos = new FormData()
    datos.append('nombre', formulario.nombre)
    datos.append('descripcion', formulario.descripcion)
    datos.append('precio', formulario.precio)
    datos.append('stock', formulario.stock)
    datos.append('categoria', formulario.categoria)
    if (imagen) datos.append('imagen', imagen)

    try {
      const respuesta = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: datos,
        },
      )
      const resultado = await respuesta.json()
      if (!respuesta.ok) throw new Error(resultado.mensaje || resultado.error || 'No se pudo guardar')

      setMensaje(editingId ? 'Producto actualizado correctamente' : 'Producto creado correctamente')
      limpiarFormulario()
      await cargarProductos()
    } catch (errorApi) {
      setError(errorApi.message)
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">MVC + React</p>
        <h1>Gestión de productos</h1>
        <p>El formulario se comunica con el controlador Express mediante la API.</p>
      </header>

      <section className="content-grid">
        <form className="product-form" onSubmit={guardarProducto}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{editingId ? 'PUT' : 'POST'}</p>
              <h2>{editingId ? 'Actualizar producto' : 'Crear producto'}</h2>
            </div>
            {editingId && (
              <button className="button button-muted" type="button" onClick={limpiarFormulario}>
                Cancelar
              </button>
            )}
          </div>

          <label>
            Nombre
            <input name="nombre" value={formulario.nombre} onChange={cambiarCampo} required />
          </label>
          <label>
            Descripción
            <textarea name="descripcion" value={formulario.descripcion} onChange={cambiarCampo} />
          </label>
          <div className="form-row">
            <label>
              Precio
              <input name="precio" type="number" min="0.01" step="0.01" value={formulario.precio} onChange={cambiarCampo} required />
            </label>
            <label>
              Stock
              <input name="stock" type="number" min="0" step="1" value={formulario.stock} onChange={cambiarCampo} required />
            </label>
          </div>
          <label>
            Categoría (ID)
            <input name="categoria" type="number" min="1" value={formulario.categoria} onChange={cambiarCampo} />
          </label>
          <label>
            Imagen (JPG, PNG o WEBP; máximo 5 MB)
            <input
              ref={inputImagenRef}
              name="imagen"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(evento) => setImagen(evento.target.files?.[0] ?? null)}
            />
          </label>

          <button className="button button-primary" type="submit">
            {editingId ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {mensaje && <p className="message success">{mensaje}</p>}
          {error && <p className="message error">{error}</p>}
        </form>

        <section className="product-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GET /productos</p>
              <h2>Productos registrados</h2>
            </div>
            <span className="count">{productos.length}</span>
          </div>
          {cargando && <p>Cargando productos...</p>}
          {!cargando && productos.length === 0 && <p className="empty-state">Todavía no hay productos.</p>}
          <div className="products">
            {productos.map((producto) => (
              <article className="product-item" key={producto.id}>
                <div>
                  <h3>{producto.nombre}</h3>
                  <p>{producto.descripcion || 'Sin descripción'}</p>
                  <small>Precio: ${producto.precio} · Stock: {producto.stock}</small>
                </div>
                <button className="button button-outline" type="button" onClick={() => editarProducto(producto)}>
                  Editar
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
