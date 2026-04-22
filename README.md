# Server SASL - Frontend Next.js

Sistema de autenticación con diseño cyberpunk oscuro/azul y soporte 2FA.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_API_URL=https://tu-backend-api.com
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Producción (Vercel)

El proyecto está optimizado para Vercel con `output: "standalone"`.

```bash
npm run build
npm run start
```

## Características

- Diseño cyberpunk oscuro/azul con animaciones
- Autenticación con 2FA
- Animaciones con Framer Motion
- Optimizado para Vercel
- TypeScript + Tailwind CSS