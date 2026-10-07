# RentaMax — Grupo 07

Sistema de inventario, alquileres y devoluciones.
Curso Integrador II: Sistemas | UTP 2026-2

## Cómo abrirlo en tu PC

1. Instala [Node.js 22](https://nodejs.org/)
2. Descomprime este ZIP
3. En una terminal, dentro de la carpeta `RentaMax-Grupo07`:

```bash
npm install
npm run dev
```

4. Abre http://localhost:8080

## Cuentas (cada una ve cosas distintas)

Las contraseñas de demostración **no se publican en el repositorio**: se entregan en el informe del APF2 o se piden al equipo.

| Rol | Correo | Qué puede hacer |
|-----|--------|-----------------|
| Operador | carlos.mendoza@rentamax.pe | Alquileres y devoluciones. Inventario solo lectura. DNI enmascarado. |
| Supervisora | ana.silva@rentamax.pe | Lo anterior + alta de equipos + DNI completo + KPI de mantenimiento. |
| Administrador | admin@rentamax.pe | Todo + bitácora de seguridad + botón Demo. |

Si un rol intenta entrar a una pantalla que no le toca, ve **Acceso restringido**.

## Cómo navegar

1. Entre con un rol.
2. Menú izquierdo: Dashboard, Inventario, Alquileres, Devoluciones.
3. El icono **?** o **Ayuda** abre la guía, los errores frecuentes y cómo resolverlos.
4. Admin: menú **Seguridad** = bitácora (login, bloqueos, denegaciones).

Guion corto para el docente: está en **Ayuda → Guion para demostrar**.

## Controles de seguridad (sílabo Unidad 2)

- Autenticación: el login llama al backend (`POST /api/auth/login`), que compara contra el hash BCrypt (coste 10) guardado en MySQL y devuelve un JWT firmado con expiración. El front guarda solo el token y lo envía como `Authorization: Bearer`.
- Autorización: RBAC en el menú **y** en cada acción (alta, reset, bitácora).
- Fuerza bruta: 5 fallos → bloqueo 2 minutos.
- Sesión: 30 min de inactividad o 8 h máximo.
- XSS: sanitización de nombres y observaciones.
- Privacidad: DNI 45****12 para el operador.
- Evidencia: bitácora en Seguridad (solo admin).

Los datos de inventario y alquileres de la demo viven en el navegador (localStorage). Usuarios, roles y contraseñas viven solo en el backend (MySQL en Aiven).

## Configuración del front (variable de entorno)

El front no trae la URL del backend escrita. Se configura con `VITE_API_URL`:

- **Vercel:** Project > Settings > Environment Variables > `VITE_API_URL` = `https://rentamax-backend.onrender.com` y volver a desplegar (la variable se incorpora al compilar).
- **Local:** copia `.env.example` a `.env.local` y ajusta el valor. El backend local debe correr en otro puerto que el front (por ejemplo `PORT=8081`).

El backend debe tener en `CORS_ORIGINS` el dominio exacto del front (por ejemplo `https://integrador2-grupo7.vercel.app`).
