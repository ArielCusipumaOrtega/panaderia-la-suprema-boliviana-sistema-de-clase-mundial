# 🥖 Panadería & Pastelería "La Suprema Boliviana"
### Sistema Empresarial de Clase Mundial para Comercialización & Logística en toda Bolivia 🇧🇴

[![CI Pipeline](https://github.com/ArielCusipumaOrtega/PANADERIA-LA-SUPREMA-BOLIVIANA-SISTEMA-DE-CLASE-MUNDIAL/actions/workflows/ci.yml/badge.svg)](https://github.com/ArielCusipumaOrtega/PANADERIA-LA-SUPREMA-BOLIVIANA-SISTEMA-DE-CLASE-MUNDIAL/actions)
![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B%20%7C%2018-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B%20%7C%2022%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Jest](https://img.shields.io/badge/Jest-100%25%20Passing-C21325?style=for-the-badge&logo=jest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

Sistema integral desarrollado en **NestJS** (TypeScript / Node.js) diseñado para operar una red de panaderías y pastelerías artesanales de alta gama con cobertura logística y despacho en los **9 departamentos de Bolivia** (Santa Cruz, La Paz, Cochabamba, Tarija, Chuquisaca, Oruro, Potosí, Beni y Pando).

Incluye **Facturación Computarizada en Línea SIAT / SIN** (con CUF, CUFD, NIT y QR Tributario), pasarela de pagos integrada para **QR Simple Interoperable (BCB / ASOBAN)** y **Tigo Money**, control estricto de **horneadas (turnos madrugada y tarde)**, materias primas, mermas y un **portal web interactivo de clase mundial** listo para usar.

---

## 🌟 Características Principales

### 1. 🗺️ Cobertura Nacional en los 9 Departamentos de Bolivia
- **Sucursales Físicas:** Santa Cruz (Equipetrol y Montero), La Paz (Sopocachi y Calacoto Zona Sur), Cochabamba (Cala Cala), Sucre (Ciudad Blanca), Tarija (El Tejar), Oruro (Pagador), Potosí (Villa Imperial), Beni (Trinidad) y Pando (Cobija).
- **Modalidades de Entrega:**
  - **Delivery Express Local:** Entrega en moto con caja térmica (30 - 45 min) para pan recién salido del horno.
  - **Retiro en Sucursal (Click & Collect):** Recogida sin costo en 15 - 30 minutos.
  - **Envío Nacional Interdepartamental:** Despacho terrestre y aéreo (courier / flota / BOA) en 24 a 48 horas con empaque en atmósfera modificada para panes de Arani, Laja, galletas y canastas.

### 2. 🥐 Catálogo de Panadería & Pastelería Tradicional e Internacional
- **Panes Tradicionales:**
  - *Marraqueta Paceña Tradicional:* Corteza crujiente cocida a la piedra con inyección de vapor.
  - *Sarnita Caliente con Queso Criollo:* Pan tierno con costra dorada de queso criollo.
  - *Cuñapé Cruceño Horneado Especial:* Almidón de yuca beniana con abundante queso chaqueño maduro.
  - *Pan de Arani Cochabambino:* Hogaza dulce del Valle Alto con canela y tapa de queso.
  - *Pan de Laja Altiplánico:* Horneado a la leña de larga conservación natural.
  - *Empanadas Blasonadas y Rollitos de Queso.*
- **Línea de Masa Madre & Artesanal:** Baguettes francesas y campesino con centeno fermentado 24 horas.
- **Línea Saludable Andina:** Pan de Quinua Real de Uyuni orgánica & Chía chiquitana.
- **Pastelería & Repostería Fina:** Torta Selva Negra macerada con **Singani boliviano de altura** y Tres Leches Suprema.
- **Canastas Familiares & Corporativas:** "Desayuno Paceño Imperial", "Lonche Camba Tradicional" y Caja de Regalo "Sabores de Toda Bolivia".

### 3. 🧾 Facturación Computarizada en Línea SIAT (SIN Bolivia)
- Generación de **CUF (Código Único de Facturación)** según algoritmo oficial SHA-256.
- Control de **CUFD (Código Único de Facturación Diario)**.
- Validación de NIT / CI de clientes bolivianos.
- Generación dinámica de **Código QR Tributario oficial del SIN**:
  `https://siat.impuestos.gob.bo/consulta/QR?nit=3049182019&cuf=...&numero=...&t=...`
- Impresión en formato ticket fiscal con **Leyenda Fiscal Ley N° 453**.

### 4. 📲 Pasarela de Pagos Boliviana Integrada
- **QR Simple Interoperable (Estándar BCB / ASOBAN):** Generación en tiempo real del código QR escaneable por cualquier aplicación bancaria boliviana (*Banco Unión, BCP, BNB, BancoSol, Banco Bisa, Banco Ganadero, Banco FIE, BMSC*).
- **Tigo Money:** Billetera móvil por número de celular.
- **Efectivo contra entrega:** Con cambio requerido en Bolivianos (BOB).
- **Tarjetas de Débito/Crédito:** Red Enlace / Libélula.

### 5. 👨‍🍳 Módulo Maestro Panadero & Producción
- Registro de lotes de horneada con código único (ej. `LOT-20260926-MAD-A1B2`).
- Turnos: **Madrugada (04:30 - 07:00 AM)**, **Tarde (15:30 - 18:30 PM)** y **Nocturno**.
- Control de temperatura del horno (°C) y maestro panadero responsable.
- **Control de Mermas de Horneada:** Registro de unidades no conformes y cálculo de porcentaje de merma para costeo exacto.
- **Actualización automática del stock** disponible por sucursal al finalizar el lote.

### 6. 📊 Tablero Gerencial & Arqueo de Caja (Analytics)
- Ventas consolidadas en Bolivianos (Bs.).
- Desglose de ventas por departamento de Bolivia.
- Productos más vendidos (Top Sellers).
- Alertas de stock mínimo en sucursales y depósitos.
- Arqueo diario de caja (desglose por efectivo, QR Simple y tarjetas).

### 7. 🌐 Portal Web & E-Commerce Integrado
- Interfaz gráfica moderna, elegante y responsiva servida en `http://localhost:3000/`.
- Permite seleccionar ciudad/departamento, agregar al carrito, cotizar flete en vivo, pagar con QR Simple y visualizar o imprimir la factura oficial SIAT.

---

## 🚀 Puesta en Marcha Rápida

### Requisitos Previos
- **Node.js**: v18, v20, v22 o v26+.
- **NPM**: v9 o superior.

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/ArielCusipumaOrtega/PANADERIA-LA-SUPREMA-BOLIVIANA-SISTEMA-DE-CLASE-MUNDIAL.git
cd PANADERIA-LA-SUPREMA-BOLIVIANA-SISTEMA-DE-CLASE-MUNDIAL
npm install
```

### 2. Configurar Variables de Entorno y PostgreSQL
Crea un archivo `.env` a partir de `.env.example`:
```bash
cp .env.example .env
```
Configura tus credenciales de PostgreSQL en `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=usr_panaderia_la_suprema
DB_PASSWORD=123456
DB_NAME=panaderia_la_suprema
JWT_SECRET=SECRETO_PANADERIA_BOLIVIANA_CLASE_MUNDIAL_2026
```
> **Nota de Alta Disponibilidad:** El sistema crea automáticamente las 8 tablas en PostgreSQL (`users`, `branches`, `products`, `stock`, `raw_materials`, `production_batches`, `orders`, `invoices`) y siembra el catálogo de panadería boliviana en el primer arranque. Si PostgreSQL no está disponible temporalmente, entra en modo de contingencia con respaldo JSON local sin interrumpir el servicio.

### 3. Compilar el Proyecto
```bash
npm run build
```

### 4. Iniciar el Servidor en Modo Desarrollo
```bash
npm run start:dev
```

El sistema iniciará y mostrará en consola:
```
================================================================
🥖 PANADERÍA LA SUPREMA BOLIVIANA - SISTEMA DE CLASE MUNDIAL 🇧🇴
================================================================
🌐 Portal Web & E-Commerce:   http://localhost:3000/
📑 Documentación Swagger:    http://localhost:3000/api/docs
⚡ Moneda oficial:           BOB (Bolivianos - Bs.)
🛡️ Facturación SIAT activa:  NIT 3049182019
📲 Pagos habilitados:        QR Simple Interoperable BCB / Tigo Money
================================================================
```

---

## 🧪 Ejecución de Pruebas

### Pruebas Unitarias (Jest)
```bash
npm test
```
*Verifica la lógica de negocio del catálogo de panes bolivianos y el cotizador de fletes de los 9 departamentos.*

### Pruebas de Integración Extremo a Extremo (E2E)
```bash
npm run test:e2e
```
*Verifica el flujo completo: Portal Web -> Catálogo -> Sucursales -> Cotización -> Pedidos con QR Simple -> Facturación SIAT -> Dashboard de analítica.*

---

## 📑 Documentación Interactiva de la API (Swagger UI)

Una vez iniciado el servidor, accede a:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

Módulos documentados con OpenAPI 3.0:
1. `1. Autenticación & Usuarios` (Login JWT, Registro con CI/NIT, Perfil)
2. `2. Sucursales & Cobertura Bolivia` (Listado por departamento, creación y estado)
3. `3. Catálogo de Panadería & Pastelería` (Productos, stock por sucursal, filtros)
4. `4. Logística & Envíos Nacionales Bolivia` (Tarifas de los 9 departamentos, cotizador)
5. `5. Producción & Hornadas (Maestro Panadero)` (Lotes de horneada, insumos, mermas)
6. `6. Pedidos & Ventas Omnicanal` (Creación de pedidos, cálculo de flete, estados)
7. `7. Pasarela de Pagos Bolivia (QR Simple & Tigo Money)` (Generación y confirmación)
8. `8. Facturación Computarizada en Línea SIAT / SIN Bolivia` (Emisión con CUF y QR)
9. `9. Reportes & Analítica de Negocio Bolivia` (Dashboard KPI en Bs., arqueo de caja)

---

## 🔐 Usuarios y Credenciales Semilla del Sistema

El sistema viene pre-poblado con cuentas para todos los roles clave:

| Rol | Correo Electrónico | Contraseña | Departamento / Sucursal |
| :--- | :--- | :--- | :--- |
| **Administrador General** | `admin@panaderia.bo` | `Admin123!` | Santa Cruz (Equipetrol) |
| **Maestro Panadero** | `panadero@panaderia.bo` | `Panadero123!` | La Paz (Sopocachi) |
| **Cajera / Ventas** | `cajero@panaderia.bo` | `Admin123!` | Santa Cruz (Equipetrol) |
| **Cliente Frecuente** | `cliente@gmail.com` | `Cliente123!` | Cochabamba (Cala Cala) |

---

## 🏗️ Arquitectura del Software

```
sistema-panaderia/
├── data/                               # Base de datos persistente JSON auto-guardada
│   └── sistema-panaderia-db.json
├── src/
│   ├── common/
│   │   ├── constants/
│   │   │   └── bolivia-regions.constant.ts   # 9 Departamentos, ciudades y tarifas
│   │   ├── enums/
│   │   │   ├── role.enum.ts                  # Roles de usuario
│   │   │   ├── order-status.enum.ts          # Estados de pedido y tipos de entrega
│   │   │   ├── payment-method.enum.ts        # QR Simple, Tigo Money, Efectivo, Tarjeta
│   │   │   └── product-category.enum.ts      # Panes, masa madre, pastelería, turnos
│   │   ├── decorators/                       # @Roles, @CurrentUser
│   │   ├── guards/                           # JwtAuthGuard, RolesGuard
│   │   ├── filters/                          # AllExceptionsFilter
│   │   └── interceptors/                     # TransformInterceptor
│   ├── database/
│   │   ├── database.service.ts               # Almacén de datos reactivo y semillas
│   │   └── database.module.ts
│   ├── modules/
│   │   ├── auth/                             # JWT, bcrypt, registro y login
│   │   ├── branches/                         # Sucursales en toda Bolivia
│   │   ├── products/                         # Panes, recetas, precios en Bs., stock
│   │   ├── logistics/                        # Cotizador y despachos express/nacionales
│   │   ├── production/                       # Lotes de horneada y control de mermas
│   │   ├── orders/                           # Pedidos omnicanal con stock sincronizado
│   │   ├── payments/                         # QR Simple BCB interoperable y pagos
│   │   ├── billing/                          # Facturación electrónica SIAT / SIN Bolivia
│   │   ├── analytics/                        # Tablero gerencial y arqueo de caja
│   │   └── storefront/                       # Aplicación Web y Portal de E-commerce
│   ├── app.module.ts                         # Módulo principal y proveedores globales
│   └── main.ts                               # Bootstrap con Swagger y CORS
├── test/
│   └── app.e2e-spec.ts                       # Suite completa de pruebas E2E
├── package.json
└── tsconfig.json
```

---

## 🇧🇴 Cumplimiento Legal y Tributario en Bolivia
- **Razón Social:** `PANADERIA & PASTELERIA ARTESANAL BOLIVIA S.R.L.`
- **NIT:** `3049182019`
- **Normativa:** Resolución Normativa de Directorio (RND) del **Servicio de Impuestos Nacionales (SIN)** para la Modalidad de Facturación Computarizada en Línea.
- **Ley N° 453:** Ley General de los Derechos de las Usuarias y los Usuarios y de las Consumidoras y los Consumidores.

---

Desarrollado con pasión para llevar el auténtico pan boliviano a nivel de clase mundial.
