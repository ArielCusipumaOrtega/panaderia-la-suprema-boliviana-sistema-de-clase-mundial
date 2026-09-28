<template>
  <footer class="bg-bakery-950 text-bakery-300 border-t border-bakery-800 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-bakery-800">
        <!-- Col 1: Brand Info -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-3xl">🥖</span>
            <span class="font-serif text-2xl font-bold text-white tracking-wide">
              La Suprema
            </span>
          </div>
          <p class="text-xs text-bakery-400 leading-relaxed">
            Red de panaderías y pastelerías artesanales bolivianas. Elaboramos pan a la piedra, masa madre viva y repostería fina con ingredientes 100% bolivianos.
          </p>
          <div class="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <span>🇧🇴 Cobertura Nacional en los 9 Departamentos</span>
          </div>
        </div>

        <!-- Col 2: Departamentos & Sucursales -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            Presencia Nacional
          </h4>
          <ul class="text-xs space-y-2 text-bakery-400">
            <li>📍 <strong>Santa Cruz:</strong> Equipetrol & Montero</li>
            <li>📍 <strong>La Paz:</strong> Sopocachi & Calacoto Zona Sur</li>
            <li>📍 <strong>Cochabamba:</strong> Av. América & Cala Cala</li>
            <li>📍 <strong>Sucre:</strong> Centro Histórico Ciudad Blanca</li>
            <li>📍 <strong>Tarija:</strong> El Tejar Tradicional</li>
            <li>📍 <strong>Oruro, Potosí, Beni y Pando:</strong> Despachos Diarios</li>
          </ul>
        </div>

        <!-- Col 3: Métodos de Pago Bolivia -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            Pagos Bolivianos 100% Seguros
          </h4>
          <div class="space-y-3 text-xs text-bakery-400">
            <div class="bg-bakery-900 p-2.5 rounded-xl border border-bakery-800 flex items-center gap-2.5">
              <span class="text-xl">📲</span>
              <div>
                <strong class="text-white block">QR Simple Interoperable</strong>
                <span class="text-[11px] text-amber-400">BCB / ASOBAN (Todos los Bancos)</span>
              </div>
            </div>
            <div class="bg-bakery-900 p-2.5 rounded-xl border border-bakery-800 flex items-center gap-2.5">
              <span class="text-xl">💳</span>
              <div>
                <strong class="text-white block">Tigo Money & Tarjetas</strong>
                <span class="text-[11px]">Billetera Móvil & Red Enlace</span>
              </div>
            </div>
            <div class="bg-bakery-900 p-2.5 rounded-xl border border-bakery-800 flex items-center gap-2.5">
              <span class="text-xl">💵</span>
              <div>
                <strong class="text-white block">Efectivo contra Entrega</strong>
                <span class="text-[11px]">En Bolivianos (BOB - Bs.)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Col 4: Facturación SIAT -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            Facturación Oficial SIAT / SIN
          </h4>
          <div class="bg-bakery-900/80 p-4 rounded-2xl border border-amber-500/20 text-xs space-y-2">
            <p class="font-bold text-amber-300">PANADERÍA & PASTELERÍA ARTESANAL BOLIVIA S.R.L.</p>
            <p class="text-[11px]"><strong>NIT:</strong> 3049182019</p>
            <p class="text-[11px]"><strong>Modalidad:</strong> Computarizada en Línea (CUF / CUFD)</p>
            <div class="text-[10px] text-amber-200/70 border-t border-bakery-800 pt-2 italic">
              "Ley N° 453: Los servicios deben prestarse en condiciones de inocuidad, calidad y seguridad."
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Credits -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-bakery-500 gap-4">
        <p>© 2026 Panadería La Suprema Boliviana S.R.L. Todos los derechos reservados.</p>
        <p class="flex items-center gap-1.5 text-bakery-400">
          Desarrollado con <span>❤️</span> para la gastronomía de Bolivia.
        </p>
      </div>
    </div>
  </footer>
</template>
