# RentaMax — Back-End (Spring Boot) · APF2

Curso Integrador II (UTP) · Grupo 07 · Avance de Proyecto Final 2.
Versiones: Spring Boot 3.4.10 · Spring Security 6.4 · Hibernate 6.6 · jjwt 0.12.5 · MySQL 8.0 · Java 21 (compatible con tu JDK 22).

## Qué hace
API REST con **autenticación JWT + BCrypt**, **RBAC por permisos guardados en la base de datos** y **CRUD de equipos** sobre MySQL con JPA.
El esquema lo define `../database/schema_v1.sql` (fuente de verdad). Hibernate corre en `ddl-auto=validate`: **no crea tablas**, solo comprueba que las entidades coincidan con el script; si no coinciden, la aplicación no arranca.

## Arquitectura por capas
```
controller/  recibe HTTP y valida (@Valid)          Auth, Equipo, Categoria, Cliente, Admin, Health
service/     reglas de negocio                      AuthService, EquipoService
repository/  acceso a datos (JPA, consultas parametrizadas)   Rol, Usuario, Categoria, Equipo, Cliente
model/       entidades JPA = tablas de schema_v1.sql          Rol, Usuario, Categoria, Equipo, Cliente
dto/         datos de entrada/salida (nunca se expone la entidad)
security/    JwtService (firma y lee el token), JwtAuthFilter (filtro por peticion)
config/      SecurityConfig (rutas, CORS, BCrypt), DataInitializer (roles y admin inicial)
exception/   errores JSON uniformes (400, 401, 403, 404, 409)
```

## Mapeo API → Base de datos
| Campo en la API | Tabla.columna | Nota |
|---|---|---|
| `email` | `usuario.correo` | el DTO conserva el nombre estándar `email` |
| `password` | `usuario.contrasena_hash` | se guarda solo el hash BCrypt (`$2a$10$…`) |
| rol (`ADMINISTRADOR`/`SUPERVISOR`/`OPERADOR`) | `rol.nombre` vía `usuario.rol_id` (FK) | |
| permisos `ALTA_EQUIPO`, `VER_DOC_COMPLETO` | `rol.permisos_alta_equipo`, `rol.permisos_ver_doc_completo` | viajan dentro del JWT |
| `categoriaId`, `stockDisponible`, `stockMinimo` | `equipo.categoria_id`, `stock_disponible`, `stock_minimo` | |

## Endpoints y permisos
| Método y ruta | OPERADOR | SUPERVISOR | ADMINISTRADOR |
|---|:-:|:-:|:-:|
| `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/register` (crea OPERADOR) | público | público | público |
| `GET /api/equipos`, `/api/equipos/{id}`, `/api/categorias` | ✅ | ✅ | ✅ |
| `GET /api/clientes` | teléfono enmascarado | completo | completo |
| `POST` / `PUT /api/equipos` | 403 | ✅ | ✅ |
| `DELETE /api/equipos/{id}` | 403 | 403 | ✅ |
| `GET /api/admin/usuarios`, `/api/admin/roles` | 403 | 403 | ✅ |

Sin token o con token inválido/alterado: **401**. Equipo inexistente: **404**. Datos inválidos (XSS, estado fuera del catálogo, stock negativo…): **400**. Código duplicado o borrar un equipo con alquileres: **409**.

## Controles de seguridad (OWASP)
| Riesgo | Control en el código |
|---|---|
| A01 Control de acceso roto | RBAC en `SecurityConfig` **y** `@PreAuthorize` en los métodos (defensa en profundidad); el rol del registro público no se puede elegir |
| A02 Fallas criptográficas | BCrypt coste 10 para contraseñas; JWT firmado (HS384); la clave JWT sale de variable de entorno y debe tener ≥ 256 bits |
| A03 Inyección | Spring Data JPA con consultas parametrizadas; validación de DTO (`@Pattern`, `@Email`, `@Size`); CHECK/UNIQUE/FK en la base |
| A05 Configuración | CORS solo para el front de Vercel; errores sin trazas; perfil `prod` sin valores por defecto (fail-fast) |
| A07 Autenticación | mensaje único "Credenciales inválidas" (no revela qué correos existen); token con expiración de 1 hora |

## Cómo correrlo en tu laptop (VS Code, Windows)
1. **Un solo MySQL en el puerto 3306:** cierra XAMPP/Wamp y deja activo el servicio `MySQL80`.
2. **Base de datos (HeidiSQL, conectado como root):** abre y ejecuta, en este orden, `database/schema_v1.sql`, `database/usuario_aplicacion.sql` (antes cambia `<CONTRASENA_FUERTE>` por una clave tuya) y `database/seed_v1.sql`.
3. **Configuración local sin secretos en Git:** copia `src/main/resources/application-local.properties.example` como `application-local.properties` (esa copia está en `.gitignore`) y completa tus valores.
4. **VS Code:** instala la extensión *Extension Pack for Java* y abre la carpeta `backend`. En la terminal, `java -version` debe decir 21 o superior.
5. **Arrancar:** dentro de `backend`: `.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"`. Espera `Started RentaMaxApplication`.
6. **Comprobar:** abre `/api/health` en el puerto 8080 de tu equipo → debe mostrar `"estado":"UP","baseDatos":"UP"`.
7. **Pruebas unitarias (JUnit 5 + Mockito):** `.\mvnw.cmd test` (no necesitan base de datos).
8. **Pruebas de integración contra la nube:** en Git Bash define `BASE_URL`, `RM_PASS_OPERADOR`, `RM_PASS_SUPERVISOR` y `RM_PASS_ADMIN` (ver cabecera de `pruebas.sh`) y ejecuta `./pruebas.sh` (esperado: `FALLOS=0`). Carga: `RM_PASS=... ./rendimiento.sh 200 20`. Postman: importar la colección **y** `RentaMax-APF2.postman_environment.json`, completar las contraseñas en el Environment y usar *Run collection*.

Las contraseñas de las cuentas de demostración **no están en el repositorio**: se entregan en el informe del APF2.

## Variables de entorno en la nube (perfil `prod`, ya activo en el Dockerfile)
| Variable | Ejemplo / uso |
|---|---|
| `DB_URL` | `jdbc:mysql://HOST:PUERTO/rentamax?sslMode=REQUIRED&serverTimezone=America/Lima` |
| `DB_USER`, `DB_PASSWORD` | credenciales de la base en Aiven (solo en el panel de Render) |
| `JWT_SECRET` | clave Base64 de ≥ 32 bytes (se genera una nueva para producción) |
| `CORS_ORIGINS` | `https://integrador2-grupo7.vercel.app` (solo el dominio del front; nunca `*`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | opcionales: solo se usan si la BD no tiene ningún administrador |

Si falta una variable obligatoria o la clave JWT es débil, la aplicación **no arranca**.
Render asigna el puerto con la variable `PORT` (la app la lee con `server.port=${PORT:8080}`).

## Pool de conexiones (HikariCP)
`maximum-pool-size=10`, `minimum-idle=5`, `connection-timeout=30000`, `idle-timeout=600000`, `max-lifetime=1800000`. Regla: tamaño ≈ (núcleos × 2) + discos; un pool muy grande gasta memoria y uno muy pequeño genera timeouts. Si un endpoint tarda más de 500 ms, revisar índices, el pool y consultas N+1.

## Alcance actual y próximo sprint
Implementado: autenticación, RBAC, CRUD de equipos, lectura de categorías y clientes sobre la BD real.
Mapeadas en la BD pero sin API todavía: `alquiler` y `devolucion` (Sprint 5).
