#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  init-project.sh  —  Inicializa los proyectos React y Node.js
#  Ejecutar UNA SOLA VEZ desde la raíz del monorepo:
#    chmod +x init-project.sh && ./init-project.sh
# ─────────────────────────────────────────────────────────────────

set -e  # abortar si cualquier comando falla

echo "──────────────────────────────────────────────"
echo "  🏗️  Inicializando proyecto Soporte TIC"
echo "──────────────────────────────────────────────"

# ── FRONTEND: React + Vite ─────────────────────────────────────
echo ""
echo "📦  Creando proyecto React con Vite..."
npm create vite@latest frontend -- --template react
cd frontend
npm install
# Dependencias de producción del frontend
npm install axios react-router-dom @tanstack/react-query zustand
# Dependencias de desarrollo
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..

echo "✅  Frontend listo"

# ── BACKEND: Node.js + Express ─────────────────────────────────
echo ""
echo "📦  Inicializando proyecto Node.js..."
cd backend
npm init -y

# Dependencias de producción
npm install \
  express \
  mongoose \
  dotenv \
  bcryptjs \
  jsonwebtoken \
  cors \
  helmet \
  express-validator \
  multer \
  morgan \
  @google/generative-ai   # SDK de Gemini (listo para cuando se integre)

# Dependencias de desarrollo
npm install -D nodemon

# Añadir scripts al package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  start: 'node src/server.js',
  dev: 'nodemon src/server.js',
  seed: 'node src/config/seed.js'
};
pkg.main = 'src/server.js';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('package.json actualizado');
"

cd ..

echo "✅  Backend listo"

# ── Archivo .env ───────────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️   Archivo .env creado desde .env.example"
  echo "    👉  EDITA .env antes de hacer docker-compose up"
fi

echo ""
echo "──────────────────────────────────────────────"
echo "  ✅  Inicialización completada"
echo ""
echo "  Próximos pasos:"
echo "  1. Edita .env con tus credenciales"
echo "  2. docker-compose up --build"
echo "──────────────────────────────────────────────"
