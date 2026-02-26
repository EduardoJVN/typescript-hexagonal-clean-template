# 🤖 Agent Instructions & Project Standards

Este archivo contiene las reglas de oro y directrices técnicas para programar en este repositorio. Cualquier IA que trabaje en este proyecto debe adherirse estrictamente a estas normas.

## 🎯 Objetivo de la Arquitectura
Implementamos **Arquitectura Hexagonal (Ports & Adapters)**. El objetivo es que el **Core** (Negocio) nunca dependa de la **Infraestructura** (Herramientas).

---

## 🏗️ Reglas de Dependencia
1. **Core es Sagrado:** No puede importar nada de `infrastructure`, ni librerías externas que no sean de lógica pura (como `zod`). 
2. **Inyección de Dependencias:** Los Casos de Uso deben recibir sus dependencias (Repositories, Services) mediante interfaces (Inversión de Dependencia).
3. **Sentido de las Flechas:** `Infrastructure` ➡️ `Core` (Permitido)
   `Core` ➡️ `Infrastructure` (PROHIBIDO)

---

## 📂 Estructura de Capas
- `@core/entities`: Objetos de dominio, reglas de negocio validadas con Zod.
- `@core/use-cases`: Orquestadores de la lógica. Solo llaman a entidades y definiciones de interfaces.
- `@infra/entry-points`: Controladores HTTP, Handlers de Lambda, CLI.
- `@infra/repositories`: Implementaciones de persistencia (Prisma, SQL, In-memory).
- `@infra/services`: Implementaciones de clientes externos (Email, Stripe, etc).
- `@shared`: Utilidades comunes que no contienen lógica de negocio.

---

## 🛠️ Stack Técnico & Restricciones
- **Runtime:** Node.js v24 LTS.
- **Formato:** ESM (EcmaScript Modules) únicamente.
- **Tipado:** TypeScript estricto. Prohibido el uso de `any`.
- **Manejo de Errores:** Evitar `throw` en el Core si es posible; preferir patrones de retorno de errores o validaciones de Zod.
- **Validación:** Usar `zod` para validar cada entrada de datos en los entry-points y en las entidades.
- **Logging:** Usar el logger `pino` (inyectado o importado en infra). No usar `console.log`.

---

## 📜 Estilo de Código
- **Path Aliasing:** Usar siempre `@core/*`, `@infra/*`, y `@shared/*`. No usar rutas relativas `../../`.
- **Interfaces:** Definir interfaces de repositorios dentro de `@core/use-cases` o una carpeta `ports` dentro de core.
- **Naming:** - Clases: PascalCase.
  - Funciones/Variables: camelCase.
  - Archivos: kebab-case (ej: `register-user.use-case.ts`).

---

## 🧪 Estándar de Testing
- **Herramienta:** Vitest.
- **Unit Tests:** Obligatorios para cada Use Case en `@core`. Usar Mocks/Spies para las interfaces de infraestructura.
- **Integration Tests:** En `@infra` para validar conexiones con DB o APIs reales/testcontainers.

---

## 🚨 Antes de generar código, verifica:
1. ¿Este nuevo archivo está en la capa correcta?
2. ¿Estoy importando algo de `/infrastructure` dentro de `/core`? (Si es así, detente).
3. ¿He definido el esquema de Zod para los datos de entrada?
4. ¿He actualizado los tests correspondientes?