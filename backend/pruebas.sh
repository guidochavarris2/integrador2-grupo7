#!/usr/bin/env bash
# =====================================================================
# RentaMax — Pruebas de integracion y seguridad (APF2)
# Uso (las claves NO viven en el repositorio; se pasan por variables de entorno):
#   export BASE_URL=https://TU-SERVICIO.onrender.com
#   export RM_PASS_OPERADOR=...  RM_PASS_SUPERVISOR=...  RM_PASS_ADMIN=...
#   ./pruebas.sh
# Requiere solo bash y curl (en Windows: Git Bash).
# Cada linea muestra OK o FALLO; al final se resume.
# =====================================================================
BASE="${BASE_URL:?Define BASE_URL con la URL publica HTTPS del servicio}"
: "${RM_PASS_OPERADOR:?Define RM_PASS_OPERADOR}"
: "${RM_PASS_SUPERVISOR:?Define RM_PASS_SUPERVISOR}"
: "${RM_PASS_ADMIN:?Define RM_PASS_ADMIN}"
ORIGEN_OK="${ORIGEN_FRONT:-https://integrador2-grupo7.vercel.app}"
OK=0; ERR=0
SUFIJO="$(date +%s)"
COD="TS-${SUFIJO: -5}"

CODE=""; BODY=""
req() { # req METODO RUTA [TOKEN] [JSON]
  local m="$1" r="$2" t="$3" d="$4"
  local args=(-s -m 30 -X "$m" -w $'\n%{http_code}' -H "Content-Type: application/json")
  [ -n "$t" ] && args+=(-H "Authorization: Bearer $t")
  [ -n "$d" ] && args+=(-d "$d")
  local out; out="$(curl "${args[@]}" "$BASE$r")"
  CODE="${out##*$'\n'}"; BODY="${out%$'\n'*}"
}
pasa() { OK=$((OK+1)); printf "  OK     %s\n" "$1"; }
falla() { ERR=$((ERR+1)); printf "  FALLO  %s  -> %s\n" "$1" "$2"; }
espera() { # espera "titulo" codigo_esperado
  if [ "$CODE" = "$2" ]; then pasa "$1 (HTTP $CODE)"; else falla "$1" "esperado $2, recibido $CODE"; fi
}
contiene() { # contiene "titulo" "texto"
  if [[ "$BODY" == *"$2"* ]]; then pasa "$1"; else falla "$1" "no aparece: $2"; fi
}
nocontiene() {
  if [[ "$BODY" != *"$2"* ]]; then pasa "$1"; else falla "$1" "aparece (no deberia): $2"; fi
}
token() { echo "$BODY" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p'; }
login() { req POST /api/auth/login "" "{\"email\":\"$1\",\"password\":\"$2\"}"; }

echo "== RentaMax pruebas contra: $BASE"
echo "-- 1. Salud y base de datos"
req GET /api/health;                 espera "Health check" 200; contiene "Base de datos conectada" '"baseDatos":"UP"'

echo "-- 2. Sin token o con token invalido (401)"
req GET /api/equipos;                espera "GET /api/equipos sin token" 401
req GET /api/equipos "token.falso.123"; espera "GET /api/equipos con token falso" 401

echo "-- 3. Validacion de entradas, XSS e inyeccion SQL"
req POST /api/auth/register "" '{"nombre":"<script>alert(1)</script>","email":"no-es-correo","password":"123"}'
espera "Registro con XSS y datos invalidos" 400
login "admin' OR '1'='1" "x";        espera "SQLi en el correo (formato invalido)" 400
login "admin@rentamax.pe" "' OR '1'='1"; espera "SQLi en la contrasena (credenciales invalidas)" 401
login "admin@rentamax.pe" "incorrecta1"; espera "Login con clave incorrecta" 401

echo "-- 4. Registro publico (siempre crea OPERADOR)"
EMAIL="prueba${SUFIJO}@rentamax.pe"
req POST /api/auth/register "" "{\"nombre\":\"Usuario Prueba\",\"email\":\"$EMAIL\",\"password\":\"Clave2026\"}"
espera "Registro valido" 201; contiene "Rol asignado OPERADOR" '"rol":"OPERADOR"'; nocontiene "No expone el hash" 'contrasena'
req POST /api/auth/register "" "{\"nombre\":\"Usuario Prueba\",\"email\":\"$EMAIL\",\"password\":\"Clave2026\"}"
espera "Registro duplicado" 409

echo "-- 5. Rol OPERADOR (solo lectura)"
login "carlos.mendoza@rentamax.pe" "$RM_PASS_OPERADOR"; espera "Login operador" 200; T_OP="$(token)"
[ -n "$T_OP" ] && pasa "Token JWT recibido" || falla "Token JWT recibido" "vacio"
req GET /api/equipos "$T_OP";        espera "Listar equipos (desde la BD)" 200; contiene "Aparece EQ-001 del seed" '"codigo":"EQ-001"'
req GET "/api/equipos?estado=DISPONIBLE" "$T_OP"; espera "Filtrar por estado" 200; nocontiene "Sin equipos ALQUILADOS en el filtro" '"estado":"ALQUILADO"'
req GET /api/equipos/9999 "$T_OP";   espera "Equipo inexistente" 404
req GET /api/equipos/abc "$T_OP";    espera "Id con formato invalido" 400
req GET /api/categorias "$T_OP";     espera "Listar categorias" 200
req GET /api/clientes "$T_OP";       espera "Listar clientes" 200; contiene "Telefono enmascarado para OPERADOR" '******321'; nocontiene "Telefono completo oculto" '987654321'
req POST /api/equipos "$T_OP" "{\"codigo\":\"$COD\",\"nombre\":\"Equipo de prueba\",\"categoriaId\":1,\"estado\":\"DISPONIBLE\",\"stockDisponible\":1,\"stockMinimo\":1}"
espera "OPERADOR no puede crear equipos" 403
req DELETE /api/equipos/1 "$T_OP";   espera "OPERADOR no puede eliminar" 403
req GET /api/admin/usuarios "$T_OP"; espera "OPERADOR no entra a /api/admin" 403

echo "-- 6. Rol SUPERVISOR (alta y edicion de equipos)"
login "ana.silva@rentamax.pe" "$RM_PASS_SUPERVISOR"; espera "Login supervisor" 200; T_SUP="$(token)"
req GET /api/clientes "$T_SUP";      espera "Listar clientes" 200; contiene "Telefono completo para SUPERVISOR" '987654321'
req POST /api/equipos "$T_SUP" "{\"codigo\":\"$COD\",\"nombre\":\"Equipo de prueba\",\"categoriaId\":1,\"estado\":\"DISPONIBLE\",\"stockDisponible\":3,\"stockMinimo\":1}"
espera "Crear equipo" 201; ID="$(echo "$BODY" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')"
[ -n "$ID" ] && pasa "Id generado por la BD: $ID" || falla "Id generado por la BD" "vacio"
req POST /api/equipos "$T_SUP" "{\"codigo\":\"$COD\",\"nombre\":\"Otro\",\"categoriaId\":1,\"estado\":\"DISPONIBLE\",\"stockDisponible\":1,\"stockMinimo\":1}"
espera "Codigo duplicado" 409
req POST /api/equipos "$T_SUP" "{\"codigo\":\"XX-999\",\"nombre\":\"<script>alert(1)</script>\",\"categoriaId\":1,\"estado\":\"DISPONIBLE\",\"stockDisponible\":1,\"stockMinimo\":1}"
espera "XSS en el nombre del equipo" 400
req POST /api/equipos "$T_SUP" "{\"codigo\":\"XX-998\",\"nombre\":\"Valido\",\"categoriaId\":1,\"estado\":\"INVENTADO\",\"stockDisponible\":1,\"stockMinimo\":1}"
espera "Estado fuera del catalogo" 400
req POST /api/equipos "$T_SUP" "{\"codigo\":\"XX-997\",\"nombre\":\"Valido\",\"categoriaId\":9999,\"estado\":\"DISPONIBLE\",\"stockDisponible\":1,\"stockMinimo\":1}"
espera "Categoria inexistente" 400
req PUT "/api/equipos/$ID" "$T_SUP" "{\"codigo\":\"$COD\",\"nombre\":\"Equipo de prueba editado\",\"categoriaId\":1,\"estado\":\"MANTENIMIENTO\",\"stockDisponible\":2,\"stockMinimo\":1}"
espera "Editar equipo" 200; contiene "Cambio de estado guardado" '"estado":"MANTENIMIENTO"'
req DELETE "/api/equipos/$ID" "$T_SUP"; espera "SUPERVISOR no puede eliminar" 403

echo "-- 7. Rol ADMINISTRADOR"
login "admin@rentamax.pe" "$RM_PASS_ADMIN"; espera "Login administrador" 200; T_AD="$(token)"
req GET /api/admin/usuarios "$T_AD"; espera "Listar usuarios" 200; nocontiene "No expone contrasena_hash" 'contrasena'; nocontiene "No expone hashes BCrypt" '$2a$'
req GET /api/admin/roles "$T_AD";    espera "Listar roles y permisos (tabla rol)" 200; contiene "Permisos desde la BD" 'permisosAltaEquipo'
req DELETE "/api/equipos/$ID" "$T_AD"; espera "Eliminar equipo de prueba" 204
req GET "/api/equipos/$ID" "$T_AD";  espera "Equipo eliminado ya no existe" 404

echo "-- 8. Token alterado y CORS"
if [ -n "$T_OP" ]; then
  MAL="${T_OP%?}X"; [ "$MAL" = "$T_OP" ] && MAL="${T_OP%?}Y"
  req GET /api/equipos "$MAL";       espera "Token con firma alterada" 401
fi
H="$(curl -s -m 20 -o /dev/null -D - -X OPTIONS -H "Origin: $ORIGEN_OK" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization" "$BASE/api/equipos")"
[[ "${H,,}" == *"access-control-allow-origin: $ORIGEN_OK"* ]] && pasa "CORS permite el front de Vercel" || falla "CORS permite el front de Vercel" "sin cabecera"
CODE_CORS="$(curl -s -m 20 -o /dev/null -w '%{http_code}' -X OPTIONS -H "Origin: https://sitio-malicioso.com" -H "Access-Control-Request-Method: GET" "$BASE/api/equipos")"
[ "$CODE_CORS" = "403" ] && pasa "CORS bloquea un origen no autorizado (HTTP 403)" || falla "CORS bloquea un origen no autorizado" "recibido $CODE_CORS"

echo
echo "=== RESULTADO: OK=$OK  FALLOS=$ERR ==="
[ "$ERR" -eq 0 ]
