# RentaMax — Back-End (Spring Boot) · Módulo de Seguridad

Semana 7 · Sesión 14 — Curso Integrador II (UTP). Grupo 07.

Versiones validadas: Spring Boot 3.4.10 · Spring Security 6.4.11 · Hibernate 6.6 · jjwt 0.12.5 · MySQL 8.0 · Java 21.

## Qué cubre (según la ficha)

| Paso de la ficha | Dónde está |
|---|---|
| 1. Dependencias Security + Validation (+ JWT, JPA, MySQL) | `pom.xml` |
| 2. Bean `BCryptPasswordEncoder` | `config/SecurityConfig.java` |
| 3. Filter Chain STATELESS + rutas públicas + RBAC | `config/SecurityConfig.java`, `security/JwtAuthFilter.java`, `controller/AdminController.java` |
| 4. Pruebas (401 sin token, hash en BD, Bearer Token) | `pruebas.sh`, `RentaMax-Seguridad.postman_collection.json` |

## Arquitectura por capas

```
controller/  -> recibe HTTP y valida (@Valid)          AuthController, EquipoController, AdminController
service/     -> reglas de negocio                      AuthService
repository/  -> acceso a datos (consultas parametrizadas) UsuarioRepository
model/       -> entidades JPA (tablas)                 Usuario, Rol
dto/         -> datos de entrada/salida del API        RegistroRequest, LoginRequest, AuthResponse, UsuarioResponse
security/    -> JWT                                    JwtService, JwtAuthFilter
config/      -> seguridad, CORS, admin inicial         SecurityConfig, DataInitializer
exception/   -> errores JSON uniformes                 GlobalExceptionHandler
```

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/register` | Público (siempre crea rol OPERADOR) |
| POST | `/api/auth/login` | Público (devuelve JWT) |
| GET | `/api/equipos` | Cualquier usuario autenticado |
| GET | `/api/admin/usuarios` | Solo ADMINISTRADOR |

Admin inicial: `admin@rentamax.pe` / `Admin2026` (cambiar con `ADMIN_PASSWORD` fuera de desarrollo).

## Cómo correrlo

**Opción A — GitHub Codespaces (sirve desde el celular o cualquier navegador)**
1. En GitHub, rama `feature/backend-seguridad` → botón **Code** → pestaña **Codespaces** → **Create codespace**.
2. Espera a que cargue (la primera vez tarda unos minutos). MySQL arranca solo.
3. En la terminal:
   ```bash
   cd backend
   docker compose up -d          # por si MySQL no arrancó
   mvn spring-boot:run
   ```
4. Espera el mensaje `Started RentaMaxApplication`.
5. Abre **otra** terminal (+) y ejecuta:
   ```bash
   cd backend && ./pruebas.sh
   ```

**Opción B — PC local** (Java 21, Maven, Docker Desktop): los mismos comandos del paso 3 y 5.
En IntelliJ: abrir la carpeta `backend`, ejecutar `RentaMaxApplication`.

## Ver el hash BCrypt en la BD
```bash
docker exec -it rentamax-mysql mysql -urentamax -prentamax123 rentamax -e "SELECT id,email,password,rol FROM usuarios;"
```
