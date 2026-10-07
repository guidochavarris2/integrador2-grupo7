# Auditoría de seguridad — RentaMax G07

Alineada al sílabo (Unidad 2: autenticación, autorización, cifrado, ataques comunes, mejores prácticas web).

## Hallazgos corregidos

| Riesgo | Antes | Ahora |
|--------|-------|--------|
| Todos los roles veían el mismo menú | Sin RBAC | Operador / Supervisora / Administrador con menú y acciones distintas |
| Contraseñas en el código del front | Usuarios y claves de demostración escritos en `store.ts`, en la ayuda y en la pantalla de login | Ninguna credencial en el front: el login llama al backend, que compara con BCrypt (coste 10) y devuelve un JWT con expiración |
| Fuerza bruta en login | Ilimitado | 5 intentos → bloqueo 2 min |
| Sesión eterna | localStorage sin caducidad | 30 min inactividad / 8 h máximo + token |
| XSS en nombre/observaciones | Texto crudo | Sanitización (sin HTML ni caracteres peligrosos) |
| PII de clientes | DNI completo a todos | Enmascarado para operador |
| Reset de demo por cualquiera | Botón visible | Solo administrador + confirmación |
| Alta de equipos por operador | Permitida | Denegada en UI y en la lógica |
| Sin evidencia para el informe | — | Bitácora de eventos (Seguridad) |
| Sin ayuda ante errores | Mensajes sueltos | Centro de Ayuda con soluciones |

## Compatibilidad

- Persistencia migrada a `rentamax-v2` (evita sesiones viejas rotas).
- Fechas en calendario UTC (no se desfasen “vence mañana”).
- Layout móvil ~390px sin desborde horizontal.
- El front requiere la variable `VITE_API_URL` (URL pública del backend).

## Pendiente para APF2 (no es un fallo de este prototipo)

- Conectar inventario, alquileres y devoluciones al API (hoy son datos de demostración en el navegador; el backend ya expone `/api/equipos`).
- Cabeceras de seguridad en el hosting (sin romper el preview).
- Pruebas de despliegue en la nube.
