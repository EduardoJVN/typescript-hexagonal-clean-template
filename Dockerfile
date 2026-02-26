# --- STAGE 1: Builder ---
FROM node:24-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias para aprovechar el cache de capas
COPY package.json yarn.lock* ./

# Instalamos todas las dependencias (incluyendo devDeps para el build)
RUN yarn install --frozen-lockfile

# Copiamos el resto del código y el script de build
COPY . .

# Generamos el bundle minificado en /dist
RUN yarn build

# --- STAGE 2: Runner ---
FROM node:24-alpine AS runner

WORKDIR /app

# Definimos el entorno como producción
ENV NODE_ENV=production

# Copiamos solo el bundle generado y el package.json del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Instalamos SOLO las dependencias de producción
# Esto es necesario porque usamos 'packages: external' en esbuild
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Usuario no-root por seguridad
USER node

# Exponemos el puerto (ajusta según tu app)
EXPOSE 3000

# Ejecutamos el bundle
CMD ["node", "dist/app.js"]