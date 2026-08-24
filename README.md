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

| Rol | Correo | Contraseña | Qué puede hacer |
|-----|--------|------------|-----------------|
| Operador | carlos.mendoza@rentamax.pe | RentaMax2026 | Alquileres y devoluciones. Inventario solo lectura. DNI enmascarado. |
| Supervisora | ana.silva@rentamax.pe | RentaMax2026 | Lo anterior + alta de equipos + DNI completo + KPI de mantenimiento. |
| Administrador | admin@rentamax.pe | Admin2026 | Todo + bitácora de seguridad + botón Demo. |

Si un rol intenta entrar a una pantalla que no le toca, ve **Acceso restringido**.

## Cómo navegar

1. Entre con un rol.
2. Menú izquierdo: Dashboard, Inventario, Alquileres, Devoluciones.
3. El icono **?** o **Ayuda** abre la guía, los errores frecuentes y cómo resolverlos.
4. Admin: menú **Seguridad** = bitácora (login, bloqueos, denegaciones).

Guion corto para el docente: está en **Ayuda → Guion para demostrar**.

## Controles de seguridad (sílabo Unidad 2)

- Autenticación: hash SHA-256 con sal (correo + contraseña), token de sesión.
- Autorización: RBAC en el menú **y** en cada acción (alta, reset, bitácora).
- Fuerza bruta: 5 fallos → bloqueo 2 minutos.
- Sesión: 30 min de inactividad o 8 h máximo.
- XSS: sanitización de nombres y observaciones.
- Privacidad: DNI 45****12 para el operador.
- Evidencia: bitácora en Seguridad (solo admin).

Los datos de la demo viven en el navegador (localStorage). La BD MySQL/API queda para APF2 (semanas 6–9).
