    // Clase para manejar el blog dinámico
    // document.querySelector('button.md:hidden').addEventListener('click', () => {
    // });
    
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
                this.conteo_guias();
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
                <article class="guia-item bg-white p-4 rounded-lg shadow-sm" data-categoria="${guia.categoria}" data-id="${guia.id}">
                    <h2 class="text-xl font-semibold mb-2">${guia.titulo}</h2>
                    <img src="${guia.imagen}" alt="${guia.titulo}" loading="lazy" class="w-full h-48 object-cover mb-3 rounded">
                    <p class="text-gray-600 mb-3">${guia.descripcion}</p>
                    <div class="guia-meta flex justify-between text-sm text-gray-500 mb-3">
                        <span class="categoria bg-gray-100 px-2 py-1 rounded">${guia.categoria}</span>
                        <span class="fecha">${this.formatearFecha(guia.fecha)}</span>
                    </div>
                    <button class="btn-leer-mas w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors" onclick="blog.mostrarDetalle('${guia.id}')">
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
                    <a href="#" class="categoria-link block py-2 px-3 rounded hover:bg-gray-50 transition-colors ${this.categoriaActual === categoria ? 'activa bg-blue-50 text-blue-600' : ''}" data-categoria="${categoria}">
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
                link.classList.remove('activa', 'bg-blue-50', 'text-blue-600');
            });
            document.querySelector(`[data-categoria="${categoria}"]`).classList.add('activa', 'bg-blue-50', 'text-blue-600');
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

        conteo_guias() {
            // Cuenta el número de guías con id válido
            const total = this.datos.guias.filter(guia => guia.id).length;
            const imprime = document.getElementById('cont_guia');
            if (imprime) {
                imprime.textContent = total;
            }
        }

        mostrarDetalle(idGuia) {
            const guia = this.datos.guias.find(g => g.id === idGuia);
            if (!guia) return;

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
             <div class="modal-contenido">
      <span class="cerrar">&times;</span>
      <h2 class="text-2xl font-bold mb-4">${guia.titulo}</h2>
      <img src="${guia.imagen}" alt="${guia.titulo}" class="w-full h-64 object-cover mb-4 rounded">
      <div class="guia-meta flex justify-between text-sm text-gray-500 mb-6">
        <span class="categoria bg-gray-100 px-2 py-1 rounded">${guia.categoria}</span>
        <span class="fecha">${this.formatearFecha(guia.fecha)}</span>
      </div>
      <div class="contenido-completo">
        <section class="mb-6">
          <strong class="block mb-2">Contexto:</strong>
          <div class="contexto-box">
            ${guia.contexto ? guia.contexto.replace(/\n/g, '<br>') : '<em>No especificado</em>'}
          </div>
        </section>
        <section class="mb-6">
          <strong class="block mb-2">Problema:</strong>
          <div class="problema-box">
            ${guia.problema ? guia.problema.replace(/\n/g, '<br>') : '<em>No especificado</em>'}
          </div>
        </section>
        <section class="mb-6">
          <strong class="block mb-2">Solución:</strong>
          <div id="solucion-contenido" class="solucion-box">
            <div id="texto-solucion">${guia.solucion ? guia.solucion.replace(/\n/g, '<br>') : '<em>No especificado</em>'}</div>
          </div>
        </section>
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
