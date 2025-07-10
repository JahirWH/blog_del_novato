// Clase para manejar el blog dinámico
class BlogDinamico {
    constructor() {
        this.datos = null;
        this.categoriaActual = 'todas';
        this.init();
    }

    async init() {
        try {
            await this.cargarDatos();
            this.renderizarGuias();
            this.renderizarCategorias();
            this.configurarBusqueda();
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    }

    async cargarDatos() {
        const respuesta = await fetch('guias.json');
        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el archivo JSON');
        }
        this.datos = await respuesta.json();    
    }

    renderizarGuias() {
        const contenedorGuias = document.getElementById('guias-container');
        if (!contenedorGuias) return;

        const guiasFiltradas = this.categoriaActual === 'todas' 
            ? this.datos.guias 
            : this.datos.guias.filter(guia => guia.categoria === this.categoriaActual);

        contenedorGuias.innerHTML = guiasFiltradas.map(guia => `
            <article class="guia-item" data-categoria="${guia.categoria}" data-id="${guia.id}">
                <h2>${guia.titulo}</h2>
                <img src="${guia.imagen}" alt="${guia.titulo}" loading="lazy">
                <p>${guia.descripcion}</p>
                <div class="guia-meta">
                    <span class="categoria">${guia.categoria}</span>
                    <span class="fecha">${this.formatearFecha(guia.fecha)}</span>
                </div>
                <button class="btn-leer-mas" onclick="blog.mostrarDetalle('${guia.id}')">
                    Leer más
                </button>
            </article>
        `).join('');
    }

    renderizarCategorias() {
        const contenedorCategorias = document.getElementById('categorias-container');
        if (!contenedorCategorias) return;

        const categoriasHTML = this.datos.categorias.map(categoria => `
            <li>
                <a href="#" class="categoria-link" data-categoria="${categoria}">
                    ${categoria}
                </a>
            </li>
        `).join('');

        contenedorCategorias.innerHTML = categoriasHTML;

        // Agregar event listeners para las categorías
        document.querySelectorAll('.categoria-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.filtrarPorCategoria(e.target.dataset.categoria);
            });
        });
    }

    filtrarPorCategoria(categoria) {
        this.categoriaActual = categoria;
        this.renderizarGuias();
        
        // Actualizar estado visual de los enlaces
        document.querySelectorAll('.categoria-link').forEach(link => {
            link.classList.remove('activa');
        });
        document.querySelector(`[data-categoria="${categoria}"]`).classList.add('activa');
    }

    configurarBusqueda() {
        const inputBusqueda = document.querySelector('.search-box input[type="text"]');
        const btnBuscar = document.querySelector('.search-box input[type="submit"]');

        const realizarBusqueda = () => {
            const termino = inputBusqueda.value.toLowerCase();
            const articulos = document.querySelectorAll('.guia-item');

            articulos.forEach(articulo => {
                const titulo = articulo.querySelector('h2').textContent.toLowerCase();
                const descripcion = articulo.querySelector('p').textContent.toLowerCase();
                const categoria = articulo.querySelector('.categoria').textContent.toLowerCase();

                const coincide = titulo.includes(termino) || 
                               descripcion.includes(termino) || 
                               categoria.includes(termino);

                articulo.style.display = coincide ? 'block' : 'none';
            });
        };

        inputBusqueda.addEventListener('input', realizarBusqueda);
        btnBuscar.addEventListener('click', (e) => {
            e.preventDefault();
            realizarBusqueda();
        });
    }

    mostrarDetalle(idGuia) {
        const guia = this.datos.guias.find(g => g.id === idGuia);
        if (!guia) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido">
                <span class="cerrar">&times;</span>
                <h2>${guia.titulo}</h2>
                <img src="${guia.imagen}" alt="${guia.titulo}">
                <div class="guia-meta">
                    <span class="categoria">${guia.categoria}</span>
                    <span class="fecha">${this.formatearFecha(guia.fecha)}</span>
                </div>
                <div class="contenido-completo">
                    <section><strong>Contexto:</strong><br>${guia.contexto ? guia.contexto.replace(/\n/g, '<br>') : '<em>No especificado</em>'}</section>
                    <section style="margin-top:10px;"><strong>Problema:</strong><br>${guia.problema ? guia.problema.replace(/\n/g, '<br>') : '<em>No especificado</em>'}</section>
                    <section style="margin-top:10px;"><strong>Solución:</strong><br>${guia.solucion ? guia.solucion.replace(/\n/g, '<br>') : '<em>No especificado</em>'}</section>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners para cerrar el modal
        modal.querySelector('.cerrar').onclick = () => {
            document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.blog = new BlogDinamico();
}); 