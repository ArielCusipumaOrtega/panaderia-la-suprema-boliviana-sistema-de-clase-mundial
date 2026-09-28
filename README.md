# 🥖 Panadería & Pastelería "La Suprema Boliviana"
### Monorepo Empresarial de Clase Mundial (NestJS Backend + Vue 3 Frontend) 🇧🇴

[![CI Pipeline](https://github.com/ArielCusipumaOrtega/PANADERIA-LA-SUPREMA-BOLIVIANA-SISTEMA-DE-CLASE-MUNDIAL/actions/workflows/ci.yml/badge.svg)](https://github.com/ArielCusipumaOrtega/PANADERIA-LA-SUPREMA-BOLIVIANA-SISTEMA-DE-CLASE-MUNDIAL/actions)
![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B%20%7C%2018-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

Monorepo de alto rendimiento diseñado para operar una red de panaderías y pastelerías artesanales con cobertura logística nacional en los **9 departamentos de Bolivia** (*Santa Cruz, La Paz, Cochabamba, Tarija, Chuquisaca, Oruro, Potosí, Beni y Pando*).

---

## 🏛️ Estructura del Monorepo

```
panaderia-la-suprema-boliviana-sistema-de-clase-mundial/
├── package.json                 # Orquestador del Monorepo (NPM Workspaces)
├── docker-compose.yml           # Stack completo: PostgreSQL + Backend + Frontend Nginx
├── .env.example                 # Variables de entorno globales
├── .github/workflows/ci.yml     # Pipeline de Integración Continua (Lint, Build & Test)
│
├── backend/                     # API RESTful en NestJS 12 (Clean Architecture & DDD)
│   ├── src/                     # Capas: Dominio, Aplicación, Infraestructura y Presentación
│   ├── test/                    # Pruebas End-to-End con Jest
│   ├── data/                    # Semilla de datos y contingencia JSON
│   ├── Dockerfile               # Contenedor Node.js optimizado
│   └── package.json             # @panaderia-bolivia/backend
│
└── frontend/                    # SPA Reactiva en Vue.js 3 + Vite + Tailwind CSS
    ├── src/
    │   ├── views/               # Catálogo, Sucursales Bolivia, Checkout, Rastreo & Dashboard
    │   ├── components/          # Navbar, Footer, QrPaymentModal, InvoiceModal, AuthModal
    │   ├── stores/              # Pinia Stores (Auth, Catalog, Cart, Order)
    │   ├── services/            # Cliente Axios con interceptor Bearer JWT
    │   └── types/               # Tipos TypeScript compartidos con backend
    ├── Dockerfile               # Contenedor Nginx estático con reverse proxy
    └── package.json             # @panaderia-bolivia/frontend
```

---

## 🌟 Capacidades de Clase Mundial

### 1. 🥐 Catálogo de Panes & Masas Típicas de Bolivia
- **Marraqueta Paceña Tradicional:** Corteza crocante cocida a la piedra con inyección de vapor.
- **Cuñapé Cruceño Especial:** Elaborado con queso chaqueño maduro y almidón de yuca beniana.
- **Pan de Arani Cochabambino:** Hogaza dulce tradicional del Valle Alto con canela y queso.
- **Pan de Laja Altiplánico:** Horneado a la leña con receta centenaria.
- **Pastelería con Singani Boliviano:** Tortas maceradas con Singani de altura.
- **Línea Saludable Andina:** Pan de Quinua Real de Uyuni y Chía chiquitana.

### 2. 🗺️ Cobertura Logística en los 9 Departamentos
- **Delivery Express Local:** Entrega en 30 a 45 minutos para pan recién salido del horno.
- **Despacho Nacional (Courier/Flota/BOA):** Cobertura interdepartamental en 24 a 48 horas con empaque en atmósfera controlada.

### 3. 🧾 Facturación Electrónica en Línea SIAT (SIN Bolivia)
- Generación de **CUF (Código Único de Facturación)** con algoritmo oficial SHA-256.
- Control de **CUFD (Código Único de Facturación Diario)**.
- **Código QR Tributario oficial de Impuestos Nacionales (SIN)**.
- Cumplimiento de **Ley N° 453**.

### 4. 📲 Pasarela de Pagos Boliviana Integrada
- **QR Simple Interoperable (BCB / ASOBAN):** Generación dinámica de QR en formato `dataUri` compatible con Banco Unión, BCP, BNB, BancoSol, Banco FIE, Banco Bisa, etc.
- **Tigo Money:** Pagos con billetera móvil.
- **Efectivo contra Entrega:** Cobro en Bolivianos (BOB - Bs.) al recibir el pedido.

### 5. 📊 Tablero Gerencial & Eficiencia de Horno
- Métricas consolidadas en Bolivianos (Bs.).
- Desglose de ingresos por departamento.
- Control de **mermas de horneada** y eficiencia del maestro panadero.

---

## 🚀 Puesta en Marcha Rápida (Local)

### 1. Clonar e Instalar Dependencias del Monorepo
```bash
git clone https://github.com/ArielCusipumaOrtega/PANADERIA-LA-SUPREMA-BOLIVIANA-SISTEMA-DE-CLASE-MUNDIAL.git
cd PANADERIA-LA-SUPREMA-BOLIVIANA-SISTEMA-DE-CLASE-MUNDIAL
npm install
```

### 2. Configurar Variables de Entorno
Crea los archivos `.env` tanto en la raíz como en `backend/`:
```bash
cp .env.example .env
cp .env.example backend/.env
```

Configura tus credenciales de PostgreSQL en `backend/.env`:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=usr_panaderia_la_suprema
DB_PASSWORD=123456
DB_NAME=panaderia_la_suprema
JWT_SECRET=SECRETO_PANADERIA_BOLIVIANA_CLASE_MUNDIAL_2026
```

### 3. Iniciar Backend y Frontend Simultáneamente
```bash
npm run dev
```

* **Frontend Vue 3 (Vite):** `http://localhost:5173/`
* **Backend API (NestJS):** `http://localhost:3000/api`
* **Swagger UI Interactivo:** `http://localhost:3000/api/docs`
* **Especificación OpenAPI JSON:** `http://localhost:3000/api/docs-json`
* **Health Check & Uptime:** `http://localhost:3000/api/health`

---

## 🐳 Despliegue con Docker Compose (Recomendado)

Inicia todo el ecosistema (PostgreSQL + Backend NestJS + Frontend Vue 3 en Nginx) con un solo comando:

```bash
docker compose up -d --build
```

El stack quedará operativo en:
- 🌐 **Frontend Web:** `http://localhost/` (Puerto 80)
- 🔌 **Backend REST API:** `http://localhost:3000/api`
- 📑 **Swagger API Docs:** `http://localhost:3000/api/docs`
- 🐘 **PostgreSQL:** `localhost:5432`

---

## 🧪 Comandos y Scripts del Monorepo

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Ejecuta concurrentemente Backend (NestJS) y Frontend (Vue 3 Vite) |
| `npm run dev:backend` | Inicia únicamente el servidor backend en modo desarrollo |
| `npm run dev:frontend` | Inicia únicamente el servidor de desarrollo Vite |
| `npm run build` | Compila tanto el backend de TypeScript como el frontend de Vue |
| `npm run lint` | Ejecuta Oxlint en los workspaces de backend y frontend |
| `npm run test` | Ejecuta la suite de pruebas unitarias del backend |
| `npm run test:e2e` | Ejecuta las pruebas de integración End-to-End |

---

## 👤 Cuentas de Acceso Rápido (Demo)

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@panaderia.bo` | `Admin123!` | Control total, sucursales, finanzas y reportes |
| **Maestro Panadero** | `panadero@panaderia.bo` | `Pan123!` | Planificación de hornadas, recetas y mermas |
| **Cajero Sucursal** | `cajero@panaderia.bo` | `Cajero123!` | Arqueo de caja, POS y confirmación de cobros |
| **Cliente** | `cliente@gmail.com` | `Cliente123!` | Catálogo, pedidos online y factura SIAT |

---

## 📜 Licencia

Distribuido bajo la Licencia **MIT**. Desarrollado con orgullo para impulsar la gastronomía y tecnología en toda Bolivia 🇧🇴.
