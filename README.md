# 🖥️ Soporte TIC — Sistema de Ticketing para Colegios

Sistema de gestión de incidencias tecnológicas (Helpdesk) desarrollado con el stack **MERN + Docker**.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js 20 + Express |
| Base de datos | MongoDB 7 |
| Infraestructura | Docker + Docker Compose |
| IA (próximo sprint) | Google Gemini API |

---

## 🚀 Levantar el proyecto (primer arranque)

### Pre-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_ORG/soporte-tic.git
cd soporte-tic

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# → Edita .env y rellena MONGO_ROOT_PASS y JWT_SECRET

# 3. ¡Un solo comando para levantar todo!
docker-compose up --build
```

Accede a:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:5000/api
- **MongoDB** → `mongodb://localhost:27017` (para MongoDB Compass)

---

## 📂 Estructura del proyecto

```
soporte-tic/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/      # llamadas a la API
│   │   └── context/       # AuthContext, etc.
│   └── Dockerfile
│
├── backend/               # Node.js + Express
│   ├── src/
│   │   ├── config/        # DB, seed.js
│   │   ├── controllers/   # lógica de negocio
│   │   ├── middleware/     # auth JWT, manejo errores
│   │   ├── models/        # esquemas Mongoose
│   │   │   ├── Usuario.js
│   │   │   ├── Incidencia.js
│   │   │   ├── Aula.js
│   │   │   ├── CodigoIncidencia.js
│   │   │   └── RegistroDocente.js
│   │   ├── routes/        # endpoints REST
│   │   └── services/
│   │       └── ai/        # integración Gemini
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## 🗃️ Modelo de datos

```
CodigoIncidencia ──< Incidencia >── Aula
                         │
                    reportadoPor ──> Usuario <── RegistroDocente
                    asignadoA   ──> Usuario
```

| Colección | Descripción |
|---|---|
| `usuarios` | Login + perfil (admin, tecnico, docente, alumno) |
| `incidencias` | Tickets de soporte — tabla central |
| `aulas` | Catálogo de aulas del colegio |
| `codigos_incidencias` | Tipos de incidencia (HW, SW, RED...) |
| `registro_docentes` | Info académica extendida del docente |

---

## 🌱 Cargar datos de prueba

```bash
# Con los contenedores corriendo:
docker exec tic_backend node src/config/seed.js
```

Usuarios de prueba creados:

| Email | Contraseña | Rol |
|---|---|---|
| admin@colegio.es | Admin1234! | admin |
| tecnico@colegio.es | Tecnico1234! | tecnico |
| mgarcia@colegio.es | Docente1234! | docente |

---

## 🛑 Parar el proyecto

```bash
docker-compose down          # para contenedores, conserva datos
docker-compose down -v       # para contenedores Y borra la BD
```

---

## 📋 Comandos útiles de desarrollo

```bash
# Ver logs en tiempo real de un servicio
docker-compose logs -f backend

# Entrar al shell del contenedor backend
docker exec -it tic_backend sh

# Reiniciar solo un servicio tras cambios en Dockerfile
docker-compose up --build backend
```

---

## 🤝 Flujo de trabajo con Git

```bash
# Nunca commits directos a main. Crear rama por feature:
git checkout -b feature/nombre-de-la-feature

# Commit con mensaje descriptivo
git commit -m "feat: añadir endpoint GET /incidencias"

# Push y Pull Request
git push origin feature/nombre-de-la-feature
```

---

*Proyecto TFGC — Formación Profesional*
