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

### 8. 🟢 Listo para Backend de Frontend Desacoplado (Vue.js 3 / Vite / Nuxt)
- **CORS Profesional con Credenciales:** Compatible con Vite (`http://localhost:5173`), Vue CLI (`http://localhost:8080`) y orígenes de producción configurables mediante `FRONTEND_URL` / `CORS_ORIGIN`.
- **Health Check & Uptime:** Endpoint `GET /api/health` para monitorización del frontend y verificación de base de datos.
- **Generación Automática de Tipos TypeScript:** Esquema OpenAPI v3 disponible en `GET /api/docs-json` para herramientas como `openapi-typescript` o `@hey-api/openapi-ts`.
- **Guía Completa de Integración:** Consulta [VUE_INTEGRATION_GUIDE.md](./VUE_INTEGRATION_GUIDE.md) para clientes Axios, tiendas Pinia y componentes de pago QR listos para copiar y usar en tu repositorio de Vue.js.

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

## 🏛️ Arquitectura Limpia (Clean Architecture & DDD)

El proyecto está diseñado bajo los principios de **Clean Architecture** (Robert C. Martin), **Domain-Driven Design (DDD)** y los principios **SOLID**, garantizando máxima testabilidad, desacoplamiento y escalabilidad:

```
src/
├── common/
│   ├── domain/
│   │   ├── value-objects/
│   │   │   └── bolivian-currency.vo.ts      # Value Object para aritmética financiera exacta en Bs.
│   │   └── exceptions/
│   │       └── domain.exceptions.ts         # Excepciones puras de dominio desacopladas de HTTP
│   ├── constants/
│   │   └── bolivia-regions.constant.ts      # 9 Departamentos, tarifas de flete y tiempos
│   ├── enums/                               # Roles, categorías de pan, turnos de horneada, pagos
│   ├── decorators/                          # @Roles, @CurrentUser
│   ├── guards/                              # JwtAuthGuard, RolesGuard
│   ├── filters/                             # AllExceptionsFilter (Mapeo global de errores a JSON)
│   └── interceptors/                        # TransformInterceptor (Envoltorio estándar de respuesta)
├── database/                                # Capa de Infraestructura & Persistencia
│   ├── database.service.ts                  # Pool PostgreSQL (pg.Pool) y persistencia reactiva
│   ├── database.module.ts                   # Inyección global de dependencias (DIP)
│   └── repositories/                        # Adaptadores de Repositorio (PostgreSQL Implementation)
│       ├── postgres-products.repository.ts
│       ├── postgres-branches.repository.ts
│       ├── postgres-users.repository.ts
│       ├── postgres-orders.repository.ts
│       ├── postgres-billing.repository.ts
│       └── postgres-production.repository.ts
├── modules/                                 # Módulos de Dominio (Bounded Contexts)
│   ├── [modulo]/
│   │   ├── domain/                          # Entidades de Dominio e Interfaces (Puertos / DIP)
│   │   │   ├── [entidad].entity.ts
│   │   │   └── [modulo].repository.interface.ts
│   │   ├── dto/                             # Data Transfer Objects validados con class-validator
│   │   ├── [modulo].service.ts              # Casos de Uso / Servicios de Aplicación (Inversión de Dependencias)
│   │   ├── [modulo].controller.ts           # Controladores REST con documentación OpenAPI Swagger
│   │   └── [modulo].module.ts               # Encapsulación NestJS
│   └── storefront/
│       ├── views/                           # Vistas desacopladas (Single Responsibility Principle)
│       │   └── storefront.view.ts
│       ├── storefront.controller.ts
│       └── storefront.module.ts
├── app.module.ts                            # Ensamblador raíz de la aplicación
└── main.ts                                  # Bootstrap con Swagger, CORS y variables de entorno
```

---

## 🇧🇴 Cumplimiento Legal y Tributario en Bolivia
- **Razón Social:** `PANADERIA & PASTELERIA ARTESANAL BOLIVIA S.R.L.`
- **NIT:** `3049182019`
- **Normativa:** Resolución Normativa de Directorio (RND) del **Servicio de Impuestos Nacionales (SIN)** para la Modalidad de Facturación Computarizada en Línea.
- **Ley N° 453:** Ley General de los Derechos de las Usuarias y los Usuarios y de las Consumidoras y los Consumidores.

---

Desarrollado con pasión para llevar el auténtico pan boliviano a nivel de clase mundial.
