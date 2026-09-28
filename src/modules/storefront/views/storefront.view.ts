export function renderStorefrontHtml(): string {
  return `<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panadería & Pastelería La Suprema Boliviana | Envíos a toda Bolivia</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Playfair Display + Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['"Playfair Display"', 'serif'],
            sans: ['Inter', 'sans-serif'],
          },
          colors: {
            pan: {
              50: '#FDF8F3',
              100: '#F7EDE2',
              200: '#EBD4BE',
              300: '#DFBA99',
              500: '#C08552',
              600: '#A06334',
              700: '#7F451E',
              800: '#5F3014',
              900: '#3D1C08',
            },
            bolivia: {
              rojo: '#E63946',
              amarillo: '#F4A261',
              verde: '#2A9D8F',
            }
          }
        }
      }
    }
  </script>
  <style>
    .badge-bolivia {
      background: linear-gradient(90deg, #E63946 33.3%, #F4A261 33.3%, #F4A261 66.6%, #2A9D8F 66.6%);
      height: 4px;
      width: 100%;
    }
    .ticket-siat {
      font-family: 'Courier New', Courier, monospace;
      background: #fafaf5;
      border: 1px dashed #c0bba8;
    }
    /* Estilos de scrollbar personalizados */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #FDF8F3; }
    ::-webkit-scrollbar-thumb { background: #C08552; border-radius: 4px; }
  </style>
</head>
<body class="bg-pan-50 text-gray-900 font-sans antialiased min-h-screen flex flex-col">

  <!-- Franja Tricolor Boliviana decorativa -->
  <div class="badge-bolivia"></div>

  <!-- Barra Superior de Notificaciones y Horarios de Hornada -->
  <div class="bg-pan-900 text-pan-100 text-xs py-2 px-4">
    <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
      <div class="flex items-center space-x-3">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-bolivia-verde text-white animate-pulse">
          <i data-lucide="flame" class="w-3.5 h-3.5 mr-1"></i> Hornadas en Vivo
        </span>
        <span class="hidden sm:inline">Madrugada: 05:00 - 08:00 AM | Lonche Caliente: 16:00 - 18:30 PM</span>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex items-center text-amber-300 font-medium">
          <i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1"></i> Cobertura en los 9 Departamentos
        </span>
        <a href="/api/docs" target="_blank" class="hover:text-amber-300 underline font-semibold flex items-center">
          <i data-lucide="code" class="w-3.5 h-3.5 mr-1"></i> API Docs (Swagger)
        </a>
      </div>
    </div>
  </div>

  <!-- Header Principal -->
  <header class="bg-white border-b border-pan-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-95">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      
      <!-- Logotipo de Clase Mundial -->
      <div class="flex items-center space-x-3 cursor-pointer" onclick="cambiarPestana('catalogo')">
        <div class="w-11 h-11 bg-pan-700 text-white rounded-xl flex items-center justify-center shadow-md">
          <i data-lucide="croissant" class="w-6 h-6"></i>
        </div>
        <div>
          <span class="font-serif text-xl sm:text-2xl font-bold text-pan-900 tracking-tight block leading-tight">
            La Suprema Boliviana
          </span>
          <span class="text-[10px] uppercase tracking-wider text-pan-600 font-bold block">
            Panadería & Pastelería de Clase Mundial
          </span>
        </div>
      </div>

      <!-- Selector de Departamento para entrega en Bolivia -->
      <div class="hidden md:flex items-center bg-pan-100 rounded-lg p-1 border border-pan-200">
        <span class="text-xs font-semibold text-pan-800 px-2 flex items-center">
          <i data-lucide="truck" class="w-3.5 h-3.5 mr-1"></i> Mi Ciudad:
        </span>
        <select id="selectorDepartamento" onchange="actualizarDepartamentoSeleccionado()" class="bg-white text-xs font-medium text-pan-900 py-1 px-2.5 rounded-md border border-pan-300 focus:outline-none focus:ring-1 focus:ring-pan-600">
          <option value="Santa Cruz" selected>Santa Cruz de la Sierra (Casa Matriz)</option>
          <option value="La Paz">La Paz (Sopocachi / Calacoto)</option>
          <option value="Cochabamba">Cochabamba (Cala Cala)</option>
          <option value="Chuquisaca">Chuquisaca (Sucre Histórica)</option>
          <option value="Tarija">Tarija (El Tejar)</option>
          <option value="Oruro">Oruro (Pagador)</option>
          <option value="Potosí">Potosí (Villa Imperial)</option>
          <option value="Beni">Beni (Trinidad)</option>
          <option value="Pando">Pando (Cobija)</option>
        </select>
      </div>

      <!-- Navegación & Botón Carrito -->
      <div class="flex items-center space-x-2 sm:space-x-4">
        <button onclick="cambiarPestana('catalogo')" id="nav-catalogo" class="px-3 py-1.5 rounded-lg text-sm font-semibold text-pan-800 hover:bg-pan-100 transition">
          Catálogo
        </button>
        <button onclick="cambiarPestana('dashboard')" id="nav-dashboard" class="px-3 py-1.5 rounded-lg text-sm font-semibold text-pan-800 hover:bg-pan-100 transition flex items-center">
          <i data-lucide="bar-chart-3" class="w-4 h-4 mr-1"></i> Panel Gerencial
        </button>
        <button onclick="abrirCarrito()" class="relative bg-pan-700 hover:bg-pan-800 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow flex items-center transition">
          <i data-lucide="shopping-bag" class="w-4 h-4 mr-1.5"></i>
          <span class="hidden sm:inline">Carrito</span>
          <span id="badgeCarritoCount" class="ml-1.5 bg-amber-400 text-pan-900 text-xs px-2 py-0.2 rounded-full font-bold">0</span>
        </button>
      </div>

    </div>
  </header>

  <!-- SECCIÓN HERO DE BIENVENIDA -->
  <section class="bg-gradient-to-r from-pan-900 via-pan-800 to-pan-900 text-white py-12 px-4 relative overflow-hidden">
    <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
      <i data-lucide="wheat" class="w-96 h-96"></i>
    </div>
    <div class="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-amber-400/30">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> El Sabor Auténtico de Bolivia en tu Mesa
        </div>
        <h1 class="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          Pan recién horneado y alta pastelería con despacho en toda Bolivia.
        </h1>
        <p class="mt-3 text-sm sm:text-base text-pan-200">
          Desde las legendarias <strong class="text-white">Marraquetas paceñas de piso</strong> y los crujientes <strong class="text-white">Cuñapés cruceños</strong>, hasta el <strong class="text-white">Pan de Arani</strong> y tortas con <strong class="text-white">Singani de altura</strong>. Facturación SIAT en línea y pago instantáneo con <strong class="text-amber-300">QR Simple BCB</strong>.
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button onclick="filtrarCategoria('PANES_TRADICIONALES')" class="bg-pan-600 hover:bg-pan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition">
            Ver Panes Tradicionales
          </button>
          <button onclick="toggleEnvioNacionalFilter()" id="btnEnvioNacionalFiltro" class="bg-pan-800/80 border border-pan-500 text-pan-100 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center">
            <i data-lucide="plane-takeoff" class="w-4 h-4 mr-1.5 text-amber-300"></i>
            Aptos Envíos Interdepartamentales
          </button>
        </div>
      </div>

      <!-- Tarjeta destacada de horneada en curso -->
      <div class="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl max-w-sm w-full text-pan-100 shadow-xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-bolivia-verde animate-ping"></span>
            <span class="text-xs uppercase tracking-wider font-bold text-white">Horno Principal Activo</span>
          </div>
          <span class="text-xs text-amber-300 font-mono">240°C Vapor</span>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-pan-300">Lote en preparación:</span>
            <span class="font-bold text-white">LOT-2026-M01</span>
          </div>
          <div class="flex justify-between">
            <span class="text-pan-300">Maestro panadero:</span>
            <span class="font-medium text-white">Don Saturnino Mamani</span>
          </div>
          <div class="flex justify-between">
            <span class="text-pan-300">Despacho más cercano:</span>
            <span class="font-medium text-amber-300" id="sucursalHeroNombre">Sucursal Equipetrol (Santa Cruz)</span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span class="text-emerald-300 font-semibold flex items-center">
            <i data-lucide="check-circle" class="w-3.5 h-3.5 mr-1"></i> Garantía de frescura
          </span>
          <span class="text-[11px] text-pan-300">Empaque grado alimenticio</span>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTENIDO PRINCIPAL: PESTAÑA CATÁLOGO -->
  <main id="seccionCatalogo" class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
    
    <!-- Filtros por Categoría de Panadería -->
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-pan-200 flex-wrap gap-4">
      <div class="flex items-center space-x-1.5 overflow-x-auto py-1">
        <button onclick="filtrarCategoria('')" class="cat-pill bg-pan-700 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm">
          Todos los Productos
        </button>
        <button onclick="filtrarCategoria('PANES_TRADICIONALES')" class="cat-pill bg-white text-pan-800 hover:bg-pan-100 border border-pan-200 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
          Panes Tradicionales Bolivianos
        </button>
        <button onclick="filtrarCategoria('EMPANADAS_MASAS_CALIENTES')" class="cat-pill bg-white text-pan-800 hover:bg-pan-100 border border-pan-200 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
          Cuñapés & Masas Calientes
        </button>
        <button onclick="filtrarCategoria('MASA_MADRE_ARTESANAL')" class="cat-pill bg-white text-pan-800 hover:bg-pan-100 border border-pan-200 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
          Masa Madre & Baguettes
        </button>
        <button onclick="filtrarCategoria('PASTELERIA_REPOSTERIA')" class="cat-pill bg-white text-pan-800 hover:bg-pan-100 border border-pan-200 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
          Tortas & Pastelería Fina
        </button>
        <button onclick="filtrarCategoria('LINEA_SALUDABLE_ANDINA')" class="cat-pill bg-white text-pan-800 hover:bg-pan-100 border border-pan-200 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
          Quinua Real & Saludables
        </button>
        <button onclick="filtrarCategoria('COMBOS_CANASTAS')" class="cat-pill bg-white text-pan-800 hover:bg-pan-100 border border-pan-200 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
          Canastas & Combos
        </button>
      </div>

      <!-- Buscador -->
      <div class="relative w-full sm:w-64">
        <i data-lucide="search" class="w-4 h-4 text-pan-400 absolute left-3 top-2.5"></i>
        <input type="text" id="inputBusqueda" oninput="buscarProductos(this.value)" placeholder="Buscar pan, cuñapé, torta..." class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-pan-300 focus:outline-none focus:ring-1 focus:ring-pan-600 bg-white">
      </div>
    </div>

    <!-- Grid de Productos -->
    <div id="gridProductos" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <!-- Inyectado por JavaScript -->
    </div>
  </main>

  <!-- PESTAÑA DASHBOARD & CONTROL GERENCIAL (Oculta por defecto) -->
  <main id="seccionDashboard" class="hidden flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
    
    <div class="flex items-center justify-between mb-8 pb-4 border-b border-pan-200">
      <div>
        <h2 class="font-serif text-2xl font-bold text-pan-900">Tablero Gerencial de Control & Producción</h2>
        <p class="text-xs text-pan-600 mt-1">Supervisión en tiempo real de ventas, mermas de horneada y cobertura nacional en Bolivia.</p>
      </div>
      <div class="flex space-x-3">
        <button onclick="cargarMetricasDashboard()" class="bg-pan-100 hover:bg-pan-200 text-pan-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5 mr-1"></i> Actualizar Datos
        </button>
      </div>
    </div>

    <!-- Tarjetas de Métricas Clave -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div class="bg-white p-5 rounded-xl border border-pan-200 shadow-sm">
        <span class="text-xs font-semibold text-pan-600 uppercase tracking-wider block">Ventas Totales</span>
        <div class="mt-2 flex items-baseline">
          <span class="text-2xl font-bold text-pan-900" id="dashTotalVentasBs">Bs. 0.00</span>
          <span class="ml-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">BOB</span>
        </div>
        <span class="text-[11px] text-gray-500 mt-1 block">Facturado bajo normativa SIAT</span>
      </div>

      <div class="bg-white p-5 rounded-xl border border-pan-200 shadow-sm">
        <span class="text-xs font-semibold text-pan-600 uppercase tracking-wider block">Pedidos Registrados</span>
        <div class="mt-2 flex items-baseline">
          <span class="text-2xl font-bold text-pan-900" id="dashTotalPedidos">0</span>
          <span class="ml-2 text-xs font-medium text-pan-600">Omnicanal</span>
        </div>
        <span class="text-[11px] text-gray-500 mt-1 block">E-commerce, WhatsApp y Tienda</span>
      </div>

      <div class="bg-white p-5 rounded-xl border border-pan-200 shadow-sm">
        <span class="text-xs font-semibold text-pan-600 uppercase tracking-wider block">Eficiencia en Horno</span>
        <div class="mt-2 flex items-baseline">
          <span class="text-2xl font-bold text-emerald-700" id="dashMermaPorcentaje">0.0%</span>
          <span class="ml-2 text-xs font-semibold text-emerald-700">Merma controlada</span>
        </div>
        <span class="text-[11px] text-gray-500 mt-1 block">Estándar mundial &lt; 2.5%</span>
      </div>

      <div class="bg-white p-5 rounded-xl border border-pan-200 shadow-sm">
        <span class="text-xs font-semibold text-pan-600 uppercase tracking-wider block">Sucursales Activas</span>
        <div class="mt-2 flex items-baseline">
          <span class="text-2xl font-bold text-pan-900" id="dashTotalSucursales">10</span>
          <span class="ml-2 text-xs font-bold text-bolivia-verde bg-teal-50 px-2 py-0.5 rounded-full">En los 9 Deptos</span>
        </div>
        <span class="text-[11px] text-gray-500 mt-1 block">Santa Cruz, La Paz, Cochabamba, etc.</span>
      </div>
    </div>

    <!-- Ventas por Departamento y Lotes de Hornada -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Ventas por Departamento -->
      <div class="bg-white p-6 rounded-xl border border-pan-200 shadow-sm">
        <h3 class="font-serif text-lg font-bold text-pan-900 mb-4 flex items-center">
          <i data-lucide="map" class="w-4 h-4 mr-2 text-pan-700"></i> Desglose de Ventas por Departamento
        </h3>
        <div id="dashListaDepartamentos" class="space-y-3 text-xs">
          <!-- Inyectado por JS -->
        </div>
      </div>

      <!-- Pedidos Recientes y Cambio de Estado en Vivo -->
      <div class="bg-white p-6 rounded-xl border border-pan-200 shadow-sm">
        <h3 class="font-serif text-lg font-bold text-pan-900 mb-4 flex items-center">
          <i data-lucide="clock" class="w-4 h-4 mr-2 text-pan-700"></i> Flujo de Pedidos en Vivo
        </h3>
        <div id="dashListaPedidos" class="space-y-3 text-xs overflow-y-auto max-h-96 pr-1">
          <!-- Inyectado por JS -->
        </div>
      </div>
    </div>

    <!-- Módulo Maestro Panadero: Iniciar Nueva Hornada -->
    <div class="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-serif text-lg font-bold text-pan-900 flex items-center">
            <i data-lucide="flame" class="w-5 h-5 mr-2 text-amber-600"></i> Registro de Hornada (Maestro Panadero)
          </h3>
          <p class="text-xs text-pan-700 mt-1">Horneada matutina o vespertina con actualización de stock automático.</p>
        </div>
      </div>
      <form id="formNuevaHornada" onsubmit="iniciarNuevaHornada(event)" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div>
          <label class="block font-semibold text-pan-800 mb-1">Sucursal:</label>
          <select id="hornadaSucursal" class="w-full p-2 bg-white rounded border border-pan-300">
            <option value="suc-scz-01">SCZ - Equipetrol</option>
            <option value="suc-lpz-01">LPZ - Sopocachi</option>
            <option value="suc-cbb-01">CBB - Cala Cala</option>
            <option value="suc-tja-01">TJA - Tarija El Tejar</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-pan-800 mb-1">Producto:</label>
          <select id="hornadaProducto" class="w-full p-2 bg-white rounded border border-pan-300">
            <option value="prod-001">Marraqueta Paceña</option>
            <option value="prod-002">Sarnita con Queso Criollo</option>
            <option value="prod-003">Cuñapé Cruceño</option>
            <option value="prod-004">Pan de Arani</option>
            <option value="prod-006">Pan de Masa Madre (24h)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-pan-800 mb-1">Turno:</label>
          <select id="hornadaTurno" class="w-full p-2 bg-white rounded border border-pan-300">
            <option value="MADRUGADA">Madrugada (04:30 AM)</option>
            <option value="TARDE">Tarde (15:30 PM)</option>
            <option value="NOCTURNO">Nocturno (Fermentación lenta)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-pan-800 mb-1">Unidades Planeadas:</label>
          <input type="number" id="hornadaCantidad" value="500" min="10" class="w-full p-2 bg-white rounded border border-pan-300">
        </div>
        <div class="flex items-end">
          <button type="submit" class="w-full bg-pan-700 hover:bg-pan-800 text-white font-semibold py-2 px-3 rounded shadow transition">
            Iniciar Hornada
          </button>
        </div>
      </form>
    </div>

  </main>

  <!-- MODAL CARRITO & CHECKOUT (Slide-over derecho) -->
  <div id="modalCarrito" class="fixed inset-0 z-50 overflow-hidden hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onclick="cerrarCarrito()"></div>
    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col">
        
        <!-- Header Carrito -->
        <div class="p-5 border-b border-pan-200 bg-pan-100 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <i data-lucide="shopping-cart" class="w-5 h-5 text-pan-800"></i>
            <h2 class="font-serif text-lg font-bold text-pan-900">Tu Canasta de Panadería</h2>
          </div>
          <button onclick="cerrarCarrito()" class="text-pan-600 hover:text-pan-900 p-1">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Lista de Items en Carrito -->
        <div id="itemsCarritoContenedor" class="flex-1 overflow-y-auto p-5 space-y-4">
          <!-- Inyectado por JS -->
        </div>

        <!-- Formulario de Checkout y Datos de Facturación Boliviana -->
        <div class="p-5 border-t border-pan-200 bg-pan-50 space-y-3 text-xs">
          <div class="font-bold text-pan-900 flex justify-between items-center">
            <span>Subtotal Productos:</span>
            <span id="txtSubtotalCarrito">Bs. 0.00</span>
          </div>
          <div class="flex justify-between items-center text-pan-700">
            <span>Flete de Envío:</span>
            <span id="txtCostoEnvioCarrito">Bs. 0.00</span>
          </div>
          <div class="flex justify-between items-center text-sm font-extrabold text-pan-900 border-t border-pan-200 pt-2">
            <span>Total a Pagar:</span>
            <span id="txtTotalCarrito" class="text-base text-pan-700 font-bold">Bs. 0.00</span>
          </div>

          <div class="pt-3 border-t border-pan-200 space-y-2">
            <div class="font-bold text-pan-900 text-[11px] uppercase tracking-wider flex items-center">
              <i data-lucide="truck" class="w-3.5 h-3.5 mr-1 text-pan-700"></i> Modalidad de Entrega:
            </div>
            <select id="chkTipoEntrega" onchange="recalcularFlete()" class="w-full p-2 bg-white rounded border border-pan-300 text-xs">
              <option value="EXPRESS_LOCAL">Delivery Express Local (en moto con caja térmica)</option>
              <option value="RETIRO_SUCURSAL">Retiro en Sucursal (Click & Collect - 0 Bs.)</option>
              <option value="ENVIO_NACIONAL">Envío Interdepartamental (Courier / Flota 24-48h)</option>
            </select>
          </div>

          <div class="space-y-2">
            <div class="font-bold text-pan-900 text-[11px] uppercase tracking-wider flex items-center">
              <i data-lucide="file-text" class="w-3.5 h-3.5 mr-1 text-pan-700"></i> Datos para Factura SIAT:
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input type="text" id="chkNombreCliente" placeholder="Nombre Completo" value="Andrea Villarroel Rojas" class="p-2 bg-white rounded border border-pan-300 text-xs">
              <input type="text" id="chkCiNit" placeholder="NIT o CI (ej: 5543210-CB)" value="5543210-CB" class="p-2 bg-white rounded border border-pan-300 text-xs">
            </div>
            <input type="text" id="chkDireccion" placeholder="Dirección de Entrega (ej: Av. América Este #780)" value="Av. América Este #780" class="w-full p-2 bg-white rounded border border-pan-300 text-xs">
            <input type="text" id="chkTelefono" placeholder="Teléfono / WhatsApp (ej: +591 70765432)" value="+591 70765432" class="w-full p-2 bg-white rounded border border-pan-300 text-xs">
          </div>

          <div class="space-y-2">
            <div class="font-bold text-pan-900 text-[11px] uppercase tracking-wider flex items-center">
              <i data-lucide="credit-card" class="w-3.5 h-3.5 mr-1 text-pan-700"></i> Método de Pago:
            </div>
            <select id="chkMetodoPago" class="w-full p-2 bg-white rounded border border-pan-300 text-xs font-semibold text-pan-900">
              <option value="QR_SIMPLE" selected>QR Simple Bolivia (BCP, BNB, Banco Unión, etc.)</option>
              <option value="EFECTIVO_CONTRAENTREGA">Efectivo contra entrega (al recibir)</option>
              <option value="TIGO_MONEY">Tigo Money (Billetera móvil)</option>
              <option value="TARJETA">Tarjeta de Débito / Crédito</option>
            </select>
          </div>

          <button onclick="procesarCheckout()" id="btnConfirmarPedido" class="w-full mt-3 bg-pan-700 hover:bg-pan-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Confirmar Pedido & Proceder</span>
          </button>
        </div>

      </div>
    </div>
  </div>

  <!-- MODAL DE PAGO QR SIMPLE BOLIVIA -->
  <div id="modalQrSimple" class="fixed inset-0 z-50 overflow-y-auto hidden flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm" onclick="cerrarModalQr()"></div>
    <div class="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-pan-300 text-center z-10">
      
      <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <span class="text-xs font-bold text-pan-700 uppercase tracking-wider flex items-center">
          <i data-lucide="qr-code" class="w-4 h-4 mr-1"></i> QR Simple Interoperable
        </span>
        <button onclick="cerrarModalQr()" class="text-gray-400 hover:text-gray-700">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <h3 class="font-serif text-xl font-bold text-pan-900">Escanea desde tu App Bancaria</h3>
      <p class="text-xs text-gray-500 mt-1">Válido para Banco Unión, BCP, BNB, BancoSol, Bisa, GanaMóvil y todas las entidades de Bolivia.</p>

      <!-- Contenedor Imagen QR -->
      <div class="my-4 p-3 bg-amber-50 rounded-xl inline-block border border-amber-200">
        <img id="imgQrSimple" src="" alt="QR Simple Bolivia" class="w-48 h-48 mx-auto rounded-lg shadow-sm">
      </div>

      <div class="text-xs space-y-1 mb-4">
        <div class="text-lg font-black text-pan-800" id="modalQrMonto">Bs. 0.00</div>
        <div class="text-gray-600 font-mono" id="modalQrCodigoPedido">BOL-PED-XXXX</div>
        <div class="text-[11px] text-amber-700 font-medium">Beneficiario: PANADERIA & PASTELERIA ARTESANAL BOLIVIA S.R.L.</div>
      </div>

      <div class="space-y-2">
        <button onclick="simularPagoExitoso()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow transition flex items-center justify-center">
          <i data-lucide="check-circle" class="w-4 h-4 mr-1.5"></i> Simular Pago Aprobado en Banco
        </button>
        <button onclick="cerrarModalQr()" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl text-xs transition">
          Pagar después
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURA COMPUTARIZADA SIAT / SIN -->
  <div id="modalFacturaSiat" class="fixed inset-0 z-50 overflow-y-auto hidden flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm" onclick="cerrarModalFactura()"></div>
    <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-pan-300 z-10">
      
      <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
        <span class="text-xs font-bold text-bolivia-verde uppercase tracking-wider flex items-center">
          <i data-lucide="shield-check" class="w-4 h-4 mr-1"></i> Facturación en Línea SIAT
        </span>
        <button onclick="cerrarModalFactura()" class="text-gray-400 hover:text-gray-700">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Ticket Tributario SIAT Oficial -->
      <div class="ticket-siat p-4 text-[11px] leading-tight space-y-2 text-gray-800 rounded">
        <div class="text-center font-bold pb-2 border-b border-gray-300">
          <p class="text-xs uppercase">PANADERIA & PASTELERIA ARTESANAL BOLIVIA S.R.L.</p>
          <p class="font-normal">Casa Matriz: Av. San Martín #450 - Santa Cruz</p>
          <p class="font-normal" id="facSucursalNombre">Sucursal: Cala Cala - Cochabamba</p>
          <p class="font-semibold mt-1">NIT: 3049182019</p>
          <p class="text-xs font-black mt-1">FACTURA N° <span id="facNumero">5001</span></p>
          <p class="text-[9px] text-gray-600">CÓD. AUTORIZACIÓN (CUF):</p>
          <p class="text-[9px] font-mono break-all text-gray-700" id="facCuf">9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A0B</p>
        </div>

        <div class="py-1 border-b border-gray-300">
          <p><strong>FECHA:</strong> <span id="facFecha">2026-09-26 16:30</span></p>
          <p><strong>NIT/CI:</strong> <span id="facClienteNit">5543210-CB</span></p>
          <p><strong>SEÑOR(ES):</strong> <span id="facClienteNombre">Andrea Villarroel Rojas</span></p>
        </div>

        <div class="py-2 border-b border-gray-300">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-gray-300">
                <th>CANT.</th>
                <th>DETALLE</th>
                <th class="text-right">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody id="facTablaItems">
              <!-- Inyectado por JS -->
            </tbody>
          </table>
        </div>

        <div class="text-right font-bold text-xs pt-1">
          TOTAL A PAGAR: <span id="facTotalBs">Bs. 75.00</span>
        </div>

        <div class="pt-2 text-center">
          <img id="facQrSiatImg" src="" alt="QR Tributario SIAT" class="w-24 h-24 mx-auto my-1 border border-gray-300 p-1 bg-white">
          <p class="text-[8px] text-gray-500 italic mt-1 leading-snug" id="facLeyenda">
            "Ley N° 453: El proveedor deberá suministrar el servicio en las modalidades y términos ofertados o convenidos."
          </p>
        </div>
      </div>

      <div class="mt-4 flex space-x-2">
        <button onclick="window.print()" class="flex-1 bg-pan-700 hover:bg-pan-800 text-white font-semibold py-2 px-3 rounded-xl text-xs shadow flex items-center justify-center">
          <i data-lucide="printer" class="w-4 h-4 mr-1"></i> Imprimir Factura
        </button>
        <button onclick="cerrarModalFactura()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-xl text-xs">
          Cerrar
        </button>
      </div>

    </div>
  </div>

  <!-- FOOTER DE CLASE MUNDIAL -->
  <footer class="bg-pan-900 text-pan-200 text-xs py-10 mt-auto border-t border-pan-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div class="flex items-center space-x-2 text-white font-serif text-lg font-bold">
          <i data-lucide="croissant" class="w-5 h-5 text-amber-400"></i>
          <span>La Suprema Boliviana</span>
        </div>
        <p class="mt-2 text-pan-400 leading-relaxed text-[11px]">
          Red de panaderías y pastelerías artesanales de alta calidad con presencia en Santa Cruz, La Paz, Cochabamba, Sucre, Tarija, Oruro, Potosí, Beni y Pando.
        </p>
        <p class="mt-3 text-[10px] text-pan-500">NIT: 3049182019 • Matrícula de Comercio Fundempresa / SEPREC N° 00482910</p>
      </div>

      <div>
        <h4 class="font-bold text-white uppercase tracking-wider mb-2 text-[11px]">Nuestros Panes Tradicionales</h4>
        <ul class="space-y-1.5 text-pan-300">
          <li>Marraqueta Paceña de Piso</li>
          <li>Sarnita con Queso Criollo</li>
          <li>Cuñapé Cruceño Caliente</li>
          <li>Pan de Arani Cochabambino</li>
          <li>Pan de Laja Altiplánico</li>
        </ul>
      </div>

      <div>
        <h4 class="font-bold text-white uppercase tracking-wider mb-2 text-[11px]">Logística Nacional Bolivia</h4>
        <ul class="space-y-1.5 text-pan-300">
          <li>Delivery Express en 35 min (Caja térmica)</li>
          <li>Despacho por Flotas / BOA a todo el país</li>
          <li>Retiro en 10 sucursales autorizadas</li>
          <li>Embalaje en atmósfera protectora</li>
        </ul>
      </div>

      <div>
        <h4 class="font-bold text-white uppercase tracking-wider mb-2 text-[11px]">Tecnología & Integración</h4>
        <div class="space-y-2">
          <span class="inline-block bg-pan-800 border border-pan-700 px-2.5 py-1 rounded text-amber-300 font-mono text-[10px]">
            QR Simple BCB / ASOBAN
          </span>
          <span class="inline-block bg-pan-800 border border-pan-700 px-2.5 py-1 rounded text-emerald-300 font-mono text-[10px]">
            Facturación en Línea SIAT
          </span>
          <div class="pt-2">
            <a href="/api/docs" target="_blank" class="text-amber-400 hover:underline flex items-center font-semibold text-[11px]">
              Explorar API REST Swagger <i data-lucide="external-link" class="w-3 h-3 ml-1"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-pan-800 text-center text-pan-500 text-[10px]">
      © 2026 Panadería & Pastelería La Suprema Boliviana S.R.L. - Desarrollado para alta escala en NestJS.
    </div>
  </footer>

  <!-- SCRIPT LOGIC JAVASCRIPT FRONTEND -->
  <script>
    // Estado Global del Cliente
    let productos = [];
    let carrito = [];
    let departamentoActual = 'Santa Cruz';
    let filtroCategoriaActual = '';
    let filtroSoloNacional = false;
    let ultimoPedidoCreado = null;

    // Inicialización al cargar la página
    document.addEventListener('DOMContentLoaded', async () => {
      lucide.createIcons();
      await cargarProductos();
      actualizarDepartamentoSeleccionado();
    });

    async function cargarProductos() {
      try {
        const res = await fetch('/api/productos');
        const data = await res.json();
        productos = data.data || [];
        renderizarProductos();
      } catch (err) {
        console.error('Error cargando productos:', err);
      }
    }

    function renderizarProductos() {
      const contenedor = document.getElementById('gridProductos');
      if (!contenedor) return;

      let filtrados = productos;
      if (filtroCategoriaActual) {
        filtrados = filtrados.filter(p => p.categoria === filtroCategoriaActual);
      }
      if (filtroSoloNacional) {
        filtrados = filtrados.filter(p => p.aptoEnvioNacional);
      }

      const busqueda = document.getElementById('inputBusqueda')?.value.toLowerCase().trim();
      if (busqueda) {
        filtrados = filtrados.filter(p => 
          p.nombre.toLowerCase().includes(busqueda) || 
          p.descripcion.toLowerCase().includes(busqueda)
        );
      }

      if (filtrados.length === 0) {
        contenedor.innerHTML = '<div class="col-span-full py-12 text-center text-pan-600 text-sm">No se encontraron productos con los filtros seleccionados.</div>';
        return;
      }

      contenedor.innerHTML = filtrados.map(p => {
        return \`
          <div class="bg-white rounded-2xl overflow-hidden border border-pan-200 shadow-sm hover:shadow-md transition flex flex-col group">
            <div class="relative h-44 overflow-hidden bg-pan-100">
              <img src="\${p.imagenUrl}" alt="\${p.nombre}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
              \${p.destacado ? '<span class="absolute top-2.5 left-2.5 bg-amber-500 text-pan-900 text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">Destacado</span>' : ''}
              \${p.aptoEnvioNacional ? '<span class="absolute top-2.5 right-2.5 bg-bolivia-verde text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow flex items-center"><i data-lucide="plane" class="w-3 h-3 mr-1"></i> Todo Bolivia</span>' : '<span class="absolute top-2.5 right-2.5 bg-amber-800 text-amber-100 text-[10px] font-semibold px-2 py-0.5 rounded shadow">Consumo Fresco</span>'}
            </div>
            
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[10px] uppercase tracking-wider text-pan-600 font-bold block mb-1">
                  \${p.categoria.replace(/_/g, ' ')}
                </span>
                <h3 class="font-serif text-base font-bold text-pan-900 leading-snug line-clamp-1">
                  \${p.nombre}
                </h3>
                <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                  \${p.descripcion}
                </p>
                <div class="mt-2 flex flex-wrap gap-1">
                  \${p.ingredientesPrincipales.slice(0, 3).map(ing => \`<span class="text-[9px] bg-pan-100 text-pan-800 px-1.5 py-0.5 rounded font-medium">\${ing}</span>\`).join('')}
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-pan-100 flex items-center justify-between">
                <div>
                  <span class="text-xs text-gray-400 block leading-none">Precio</span>
                  <span class="text-lg font-black text-pan-800">Bs. \${p.precioBs.toFixed(2)}</span>
                  <span class="text-[10px] text-gray-500">/\${p.unidadMedida}</span>
                </div>
                <button onclick="agregarAlCarrito('\${p.id}')" class="bg-pan-700 hover:bg-pan-800 text-white p-2 rounded-xl text-xs font-semibold shadow transition flex items-center">
                  <i data-lucide="plus" class="w-4 h-4 mr-1"></i> Agregar
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');

      lucide.createIcons();
    }

    function filtrarCategoria(cat) {
      filtroCategoriaActual = cat;
      document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.classList.remove('bg-pan-700', 'text-white');
        btn.classList.add('bg-white', 'text-pan-800');
      });
      event?.target?.classList?.remove('bg-white', 'text-pan-800');
      event?.target?.classList?.add('bg-pan-700', 'text-white');
      renderizarProductos();
    }

    function toggleEnvioNacionalFilter() {
      filtroSoloNacional = !filtroSoloNacional;
      const btn = document.getElementById('btnEnvioNacionalFiltro');
      if (filtroSoloNacional) {
        btn.classList.add('bg-amber-500', 'text-pan-900', 'font-bold');
        btn.classList.remove('bg-pan-800/80', 'text-pan-100');
      } else {
        btn.classList.remove('bg-amber-500', 'text-pan-900', 'font-bold');
        btn.classList.add('bg-pan-800/80', 'text-pan-100');
      }
      renderizarProductos();
    }

    function buscarProductos(term) {
      renderizarProductos();
    }

    function actualizarDepartamentoSeleccionado() {
      const sel = document.getElementById('selectorDepartamento');
      departamentoActual = sel ? sel.value : 'Santa Cruz';
      const heroSpan = document.getElementById('sucursalHeroNombre');
      if (heroSpan) {
        heroSpan.innerText = 'Sucursal Autorizada (' + departamentoActual + ')';
      }
      recalcularFlete();
    }

    function agregarAlCarrito(productoId) {
      const prod = productos.find(p => p.id === productoId);
      if (!prod) return;

      const itemExistente = carrito.find(item => item.productoId === productoId);
      if (itemExistente) {
        itemExistente.cantidad += 1;
      } else {
        carrito.push({
          productoId: prod.id,
          nombre: prod.nombre,
          precioBs: prod.precioBs,
          aptoEnvioNacional: prod.aptoEnvioNacional,
          cantidad: 1,
        });
      }

      actualizarBadgeCarrito();
      abrirCarrito();
    }

    function actualizarBadgeCarrito() {
      const badge = document.getElementById('badgeCarritoCount');
      const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
      if (badge) badge.innerText = totalItems;
    }

    function abrirCarrito() {
      document.getElementById('modalCarrito')?.classList.remove('hidden');
      renderizarItemsCarrito();
      recalcularFlete();
    }

    function cerrarCarrito() {
      document.getElementById('modalCarrito')?.classList.add('hidden');
    }

    function modificarCantidadCarrito(productoId, delta) {
      const item = carrito.find(i => i.productoId === productoId);
      if (!item) return;

      item.cantidad += delta;
      if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.productoId !== productoId);
      }
      actualizarBadgeCarrito();
      renderizarItemsCarrito();
      recalcularFlete();
    }

    function renderizarItemsCarrito() {
      const contenedor = document.getElementById('itemsCarritoContenedor');
      if (!contenedor) return;

      if (carrito.length === 0) {
        contenedor.innerHTML = \`
          <div class="py-12 text-center text-gray-400">
            <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto mb-2 opacity-30"></i>
            <p class="text-xs">Tu canasta está vacía.</p>
            <p class="text-[11px] text-gray-500 mt-1">Elige entre nuestras marraquetas, cuñapés o tortas artesanales.</p>
          </div>
        \`;
        lucide.createIcons();
        return;
      }

      contenedor.innerHTML = carrito.map(item => \`
        <div class="flex items-center justify-between p-3 bg-pan-50 rounded-xl border border-pan-200 text-xs">
          <div class="flex-1 pr-2">
            <span class="font-bold text-pan-900 block leading-snug">\${item.nombre}</span>
            <span class="text-pan-700 font-semibold">Bs. \${item.precioBs.toFixed(2)} c/u</span>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="modificarCantidadCarrito('\${item.productoId}', -1)" class="w-6 h-6 rounded bg-white border border-pan-300 font-bold flex items-center justify-center hover:bg-pan-100">-</button>
            <span class="font-bold text-pan-900 px-1">\${item.cantidad}</span>
            <button onclick="modificarCantidadCarrito('\${item.productoId}', 1)" class="w-6 h-6 rounded bg-white border border-pan-300 font-bold flex items-center justify-center hover:bg-pan-100">+</button>
          </div>
        </div>
      \`).join('');

      lucide.createIcons();
    }

    function recalcularFlete() {
      const subtotal = carrito.reduce((acc, i) => acc + (i.precioBs * i.cantidad), 0);
      const tipoEntrega = document.getElementById('chkTipoEntrega')?.value || 'EXPRESS_LOCAL';
      
      let costoEnvio = 0;
      if (tipoEntrega === 'EXPRESS_LOCAL') {
        costoEnvio = (departamentoActual === 'Santa Cruz' || departamentoActual === 'Cochabamba') ? 10 : 12;
      } else if (tipoEntrega === 'ENVIO_NACIONAL') {
        costoEnvio = 25;
      } else if (tipoEntrega === 'RETIRO_SUCURSAL') {
        costoEnvio = 0;
      }

      const total = subtotal + costoEnvio;

      document.getElementById('txtSubtotalCarrito').innerText = 'Bs. ' + subtotal.toFixed(2);
      document.getElementById('txtCostoEnvioCarrito').innerText = 'Bs. ' + costoEnvio.toFixed(2);
      document.getElementById('txtTotalCarrito').innerText = 'Bs. ' + total.toFixed(2);
    }

    async function procesarCheckout() {
      if (carrito.length === 0) {
        alert('Por favor añade productos a tu canasta antes de confirmar.');
        return;
      }

      const nombre = document.getElementById('chkNombreCliente')?.value.trim();
      const ciNit = document.getElementById('chkCiNit')?.value.trim();
      const direccion = document.getElementById('chkDireccion')?.value.trim();
      const telefono = document.getElementById('chkTelefono')?.value.trim();
      const tipoEntrega = document.getElementById('chkTipoEntrega')?.value;
      const metodoPago = document.getElementById('chkMetodoPago')?.value;

      if (!nombre || !ciNit || !direccion || !telefono) {
        alert('Por favor completa todos los datos para la entrega y facturación SIAT.');
        return;
      }

      const payload = {
        clienteNombre: nombre,
        clienteTelefono: telefono,
        clienteCiNit: ciNit,
        razonSocialFactura: nombre,
        departamentoDestino: departamentoActual,
        ciudadDestino: departamentoActual,
        direccionEntrega: direccion,
        tipoEntrega: tipoEntrega,
        items: carrito.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
        metodoPago: metodoPago,
      };

      const btn = document.getElementById('btnConfirmarPedido');
      btn.disabled = true;
      btn.innerText = 'Procesando pedido y emitiendo factura SIAT...';

      try {
        const res = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!data.exito && data.statusCode >= 400) {
          alert('Aviso: ' + (data.mensaje || 'Error al procesar el pedido'));
          btn.disabled = false;
          btn.innerText = 'Confirmar Pedido & Proceder';
          return;
        }

        const pedido = data.data || data;
        ultimoPedidoCreado = pedido;
        carrito = [];
        actualizarBadgeCarrito();
        cerrarCarrito();

        // Si el pago es QR Simple, abrimos el modal interactivo con el QR
        if (metodoPago === 'QR_SIMPLE' && pedido.qrSimpleDataUri) {
          abrirModalQr(pedido);
        } else {
          // Emitir y mostrar factura SIAT directamente
          await emitirYMostrarFacturaSiat(pedido.id);
        }
      } catch (err) {
        console.error('Error en checkout:', err);
        alert('Hubo un inconveniente al conectar con el servidor.');
      } finally {
        btn.disabled = false;
        btn.innerText = 'Confirmar Pedido & Proceder';
      }
    }

    function abrirModalQr(pedido) {
      document.getElementById('imgQrSimple').src = pedido.qrSimpleDataUri;
      document.getElementById('modalQrMonto').innerText = 'Bs. ' + pedido.totalBs.toFixed(2);
      document.getElementById('modalQrCodigoPedido').innerText = pedido.codigoPedido;
      document.getElementById('modalQrSimple').classList.remove('hidden');
    }

    function cerrarModalQr() {
      document.getElementById('modalQrSimple').classList.add('hidden');
    }

    async function simularPagoExitoso() {
      if (!ultimoPedidoCreado) return;
      try {
        await fetch('/api/pagos/confirmar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pedidoId: ultimoPedidoCreado.id,
            metodoPago: 'QR_SIMPLE',
            numeroTransaccion: 'BCP-QR-' + Math.floor(Math.random() * 900000 + 100000),
          }),
        });
        cerrarModalQr();
        // Emitir y mostrar Factura SIAT
        await emitirYMostrarFacturaSiat(ultimoPedidoCreado.id);
      } catch (err) {
        console.error('Error simulando pago:', err);
      }
    }

    async function emitirYMostrarFacturaSiat(pedidoId) {
      try {
        const res = await fetch('/api/facturacion/emitir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedidoId }),
        });
        const json = await res.json();
        const fac = json.data || json;

        document.getElementById('facNumero').innerText = fac.numeroFactura;
        document.getElementById('facCuf').innerText = fac.cuf;
        document.getElementById('facFecha').innerText = fac.fechaEmision.replace('T', ' ').slice(0, 19);
        document.getElementById('facClienteNit').innerText = fac.nitCiCliente;
        document.getElementById('facClienteNombre').innerText = fac.razonSocialCliente;
        document.getElementById('facTotalBs').innerText = 'Bs. ' + fac.montoTotalBs.toFixed(2);
        document.getElementById('facQrSiatImg').src = fac.qrSiatDataUri;
        document.getElementById('facLeyenda').innerText = fac.leyendaFiscal;

        // Renderizar tabla de items en factura
        if (ultimoPedidoCreado && ultimoPedidoCreado.items) {
          const tbody = document.getElementById('facTablaItems');
          tbody.innerHTML = ultimoPedidoCreado.items.map(it => \`
            <tr>
              <td>\${it.cantidad}</td>
              <td>\${it.nombreProducto}</td>
              <td class="text-right">Bs. \${it.subtotalBs.toFixed(2)}</td>
            </tr>
          \`).join('');
        }

        document.getElementById('modalFacturaSiat').classList.remove('hidden');
      } catch (err) {
        console.error('Error obteniendo factura:', err);
      }
    }

    function cerrarModalFactura() {
      document.getElementById('modalFacturaSiat').classList.add('hidden');
    }

    // Pestañas (Catálogo vs Dashboard Gerencial)
    function cambiarPestana(pestana) {
      const secCat = document.getElementById('seccionCatalogo');
      const secDash = document.getElementById('seccionDashboard');
      const navCat = document.getElementById('nav-catalogo');
      const navDash = document.getElementById('nav-dashboard');

      if (pestana === 'catalogo') {
        secCat.classList.remove('hidden');
        secDash.classList.add('hidden');
        navCat.classList.add('bg-pan-100', 'text-pan-900');
        navDash.classList.remove('bg-pan-100', 'text-pan-900');
      } else {
        secCat.classList.add('hidden');
        secDash.classList.remove('hidden');
        navDash.classList.add('bg-pan-100', 'text-pan-900');
        navCat.classList.remove('bg-pan-100', 'text-pan-900');
        cargarMetricasDashboard();
      }
    }

    async function cargarMetricasDashboard() {
      try {
        const res = await fetch('/api/analitica/dashboard');
        const json = await res.json();
        const d = json.data || json;

        document.getElementById('dashTotalVentasBs').innerText = 'Bs. ' + (d.totalVentasBs || 0).toFixed(2);
        document.getElementById('dashTotalPedidos').innerText = d.totalPedidosRegistrados || 0;
        document.getElementById('dashMermaPorcentaje').innerText = d.produccion?.porcentajeMerma || '0.0%';
        document.getElementById('dashTotalSucursales').innerText = d.totalSucursalesActivas || 10;

        // Renderizar lista de ventas por departamento
        const listaDeptos = document.getElementById('dashListaDepartamentos');
        if (listaDeptos && d.ventasPorDepartamento) {
          listaDeptos.innerHTML = Object.entries(d.ventasPorDepartamento).map(([depto, datos]) => {
            const porcentaje = d.totalVentasBs > 0 ? (datos.totalBs / d.totalVentasBs) * 100 : 0;
            return \`
              <div>
                <div class="flex justify-between font-semibold text-pan-800">
                  <span>\${depto}</span>
                  <span>Bs. \${datos.totalBs.toFixed(2)} (\${datos.cantidadPedidos} pedidos)</span>
                </div>
                <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1">
                  <div class="bg-pan-600 h-full rounded-full" style="width: \${porcentaje}%"></div>
                </div>
              </div>
            \`;
          }).join('');
        }

        // Cargar lista de pedidos recientes
        const resPed = await fetch('/api/pedidos');
        const jsonPed = await resPed.json();
        const pedidos = jsonPed.data || jsonPed;
        const listaPed = document.getElementById('dashListaPedidos');
        if (listaPed && Array.isArray(pedidos)) {
          listaPed.innerHTML = pedidos.slice(0, 10).map(p => \`
            <div class="p-3 bg-pan-50 border border-pan-200 rounded-lg flex items-center justify-between">
              <div>
                <span class="font-bold text-pan-900 block">\${p.codigoPedido} - \${p.clienteNombre}</span>
                <span class="text-pan-600 block">\${p.departamentoDestino} • Bs. \${p.totalBs.toFixed(2)} • \${p.metodoPago}</span>
              </div>
              <div class="text-right">
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 mb-1">
                  \${p.estado}
                </span>
                <button onclick="cambiarEstadoPedidoRapido('\${p.id}')" class="block text-[10px] text-pan-700 underline font-semibold">
                  Avanzar Estado
                </button>
              </div>
            </div>
          \`).join('');
        }
      } catch (err) {
        console.error('Error cargando métricas:', err);
      }
    }

    async function cambiarEstadoPedidoRapido(pedidoId) {
      const estados = ['CONFIRMADO', 'EN_HORNEADA', 'EMPACADO', 'EN_CAMINO', 'ENTREGADO'];
      const nuevo = prompt('Ingrese nuevo estado (CONFIRMADO, EN_HORNEADA, EMPACADO, EN_CAMINO, ENTREGADO):', 'EN_HORNEADA');
      if (!nuevo) return;

      try {
        await fetch(\`/api/pedidos/\${pedidoId}/estado\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nuevoEstado: nuevo.trim().toUpperCase() }),
        });
        cargarMetricasDashboard();
      } catch (err) {
        console.error('Error actualizando estado:', err);
      }
    }

    async function iniciarNuevaHornada(e) {
      e.preventDefault();
      const sucursalId = document.getElementById('hornadaSucursal').value;
      const productoId = document.getElementById('hornadaProducto').value;
      const turno = document.getElementById('hornadaTurno').value;
      const cantidad = parseInt(document.getElementById('hornadaCantidad').value, 10);

      try {
        const res = await fetch('/api/produccion/iniciar-hornada', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sucursalId,
            productoId,
            turno,
            cantidadPlaneada: cantidad,
            temperaturaHornoC: 235,
            maestroPanadero: 'Don Saturnino Mamani',
          }),
        });
        const json = await res.json();
        alert('Hornada iniciada con éxito. Código de Lote: ' + (json.data?.codigoLote || json.codigoLote));
        cargarMetricasDashboard();
      } catch (err) {
        console.error('Error al iniciar hornada:', err);
      }
    }
  </script>
</body>
</html>`;
}
