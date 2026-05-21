# ─────────────────────────────────────────────────────────────
#  BACKEND  —  Node.js 20 LTS + Express
#  Usa nodemon en desarrollo para hot-reload automático
# ─────────────────────────────────────────────────────────────

FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar manifiestos primero → la capa de dependencias se cachea
# y no se reinstala si solo cambias el código fuente
COPY package*.json ./

# Instalar TODAS las dependencias (incluye devDependencies como nodemon)
RUN npm install

# Copiar el resto del código
COPY . .

# Puerto que expone el backend
EXPOSE 5000

# nodemon vigila cambios y reinicia el servidor automáticamente
CMD ["npx", "nodemon", "src/server.js"]
