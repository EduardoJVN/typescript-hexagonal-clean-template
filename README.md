# 🏗️ Hexagonal Clean Template (Node 24 LTS)

Una base sólida, agnóstica y ultra-rápida para proyectos Backend. Diseñada bajo los principios de **Arquitectura Hexagonal** y **Clean Code**, preparada para ser desplegada en cualquier entorno (Express, Fastify, AWS Lambda o Google Cloud Functions).

[![Node Version](https://img.shields.io/badge/node-%3E%3D24.14.0-green)](https://nodejs.org/)
[![Typescript](https://img.shields.io/badge/typescript-5.7+-blue)](https://www.typescriptlang.org/)
[![Testing](https://img.shields.io/badge/test-vitest-yellow)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-purple)](#)

---

## 🚀 Características Principales

- **Runtime:** Node.js 24 (LTS) con soporte nativo para módulos ESM.
- **Transpilación:** `esbuild` para builds instantáneos y `tsx` para un desarrollo fluido.
- **Calidad de Código:** ESLint 10 (Flat Config) + Prettier (separados para máximo rendimiento).
- **Testing:** Vitest con soporte nativo de TypeScript y Path Aliasing.
- **Validación:** Zod para esquemas de datos y validación de DTOs.
- **Observabilidad:** Pino + Pino Pretty para logs estructurados de alto rendimiento.
- **DX (Developer Experience):** - Path Aliasing (`@core`, `@infra`, `@shared`).
  - Husky + Commitlint para mensajes de commit estandarizados.

---

## 📂 Estructura del Proyecto

El corazón del proyecto es **agnóstico a la tecnología**. La infraestructura es solo un detalle de implementación en la capa externa.



```text
src/
├── core/                 # Lógica de Negocio Pura (Independiente)
│   ├── entities/         # Modelos de dominio (Clases o Interfaces)
│   └── use-cases/        # Reglas de negocio (Orquestadores)
├── infrastructure/       # Implementaciones Técnicas (Mecanismos)
│   ├── entry-points/     # Servidores (Express, Lambdas, CLI)
│   ├── repositories/     # Adaptadores de BD (Prisma, SQL, In-memory)
│   └── services/         # Clientes externos (APIs, Email, S3)
├── shared/               # Código común, utilidades y constantes
└── server.ts             # Punto de entrada principal

```

## 🛠️ Comandos Disponibles

|           Comando         |                       Descripción                             |
| ------------------------- |:-------------------------------------------------------------:|
| `npm run dev`             | Inicia el modo desarrollo con hot-reload usando `tsx`         |
| `npm run build`           | Genera un bundle optimizado en `/dist` mediante `esbuild`.    |
| `npm run test`            | Ejecuta la suite de pruebas con Vitest.                       |
| `npm run test:unit`       | Ejecuta la suite de pruebas con Vitest.                       |
| `npm run lint`            | Analiza el código buscando errores de calidad.                |
| `npm run format`          | Formatea automáticamente el código con Prettier.              |
| `npm run test:coverage`   | Genera un reporte de cobertura de pruebas.                    |


## 💉 Inyección de Dependencias (Agnóstica)

Para que el núcleo sea reutilizable, inyecta las implementaciones de infraestructura en los casos de uso:

```typescript
    // Ejemplo: src/infrastructure/entry-points/server.ts
    const repository = new PostgresUserRepository();
    const registerUser = new RegisterUser(repository); // El caso de uso solo conoce la interfaz

    // Este mismo 'registerUser' puede ser llamado desde un Controller de Express
    // o desde el Handler de una AWS Lambda.
```


## ⚙️ Configuración Inicial
1. Instalar dependencias:
```bash
    npm install
```
2. Variables de entorno:
Copia el archivo de ejemplo y configura tus variables:
```bash
    cp .env.example .env
```
3. Git Hooks:
Husky se configurará automáticamente para validar tus commits.

## 🤝 Convenciones de Código
- **Commits:** Siguen el estándar de Conventional Commits.
- **Imports:** Usa siempre los alias configurados:
    - `@core/` para lógica de negocio.
    - `@infra/` para adaptadores y drivers.
    - `@shared/` para herramientas transversales.