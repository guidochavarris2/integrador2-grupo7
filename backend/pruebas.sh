#!/usr/bin/env bash
# Pruebas del Paso 4 de la ficha. Uso: ./pruebas.sh   (con el API ya corriendo)
API=${API:-http://localhost:8080}
V='\033[1;32m'; R='\033[1;31m'; A='\033[1;36m'; N='\033[0m'
EMAIL="operador$(date +%s)@rentamax.pe"

check () { # $1=titulo $2=codigo_esperado $3=codigo_real $4=cuerpo
  if [ "$2" == "$3" ]; then echo -e "${V}[OK ]${N} $1 -> HTTP $3"; else echo -e "${R}[ERR]${N} $1 -> esperado $2, llego $3"; fi
  echo "      $4" | cut -c1-220; echo
}
req () { # devuelve "cuerpo|codigo"
  curl -s -w '|%{http_code}' "$@"
}

echo -e "${A}=== 1. Ruta protegida SIN token ===${N}"
r=$(req "$API/api/equipos"); check "GET /api/equipos sin token" 401 "${r##*|}" "${r%|*}"

echo -e "${A}=== 2. Ruta protegida con token FALSO ===${N}"
r=$(req -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoYWNrZXIiLCJyb2xlIjoiQURNSU5JU1RSQURPUiJ9.firmaFalsa" "$API/api/equipos")
check "GET /api/equipos con token falso" 401 "${r##*|}" "${r%|*}"

echo -e "${A}=== 3. Validacion de DTO (datos malos) ===${N}"
r=$(req -X POST "$API/api/auth/register" -H 'Content-Type: application/json' \
  -d '{"nombre":"<script>alert(1)</script>","email":"no-es-correo","password":"123"}')
check "POST /register con XSS y datos invalidos" 400 "${r##*|}" "${r%|*}"

echo -e "${A}=== 4. Registro de usuario ===${N}"
r=$(req -X POST "$API/api/auth/register" -H 'Content-Type: application/json' \
  -d "{\"nombre\":\"Carlos Mendoza\",\"email\":\"$EMAIL\",\"password\":\"RentaMax2026\"}")
check "POST /register $EMAIL" 201 "${r##*|}" "${r%|*}"

echo -e "${A}=== 5. Contrasena en la BD (debe verse el hash BCrypt \$2a\$10\$...) ===${N}"
docker exec rentamax-mysql mysql -urentamax -prentamax123 rentamax \
  -e "SELECT id, email, password, rol FROM usuarios;" 2>/dev/null || echo "(revisa manualmente la tabla usuarios)"
echo

echo -e "${A}=== 6. Login con clave incorrecta ===${N}"
r=$(req -X POST "$API/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"Incorrecta1\"}")
check "POST /login clave incorrecta" 401 "${r##*|}" "${r%|*}"

echo -e "${A}=== 7. Login correcto (operador) ===${N}"
r=$(req -X POST "$API/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"RentaMax2026\"}")
check "POST /login operador" 200 "${r##*|}" "${r%|*}"
TOKEN_OP=$(echo "${r%|*}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo -e "${A}=== 8. Ruta protegida CON token valido ===${N}"
r=$(req -H "Authorization: Bearer $TOKEN_OP" "$API/api/equipos"); check "GET /api/equipos con token de operador" 200 "${r##*|}" "${r%|*}"

echo -e "${A}=== 9. RBAC: operador intenta entrar a /api/admin ===${N}"
r=$(req -H "Authorization: Bearer $TOKEN_OP" "$API/api/admin/usuarios"); check "GET /api/admin/usuarios como OPERADOR" 403 "${r##*|}" "${r%|*}"

echo -e "${A}=== 10. Token ALTERADO (se modifica 1 caracter de la firma) ===${N}"
ULT=${TOKEN_OP: -1}; if [ "$ULT" == "A" ]; then NUEVO=B; else NUEVO=A; fi
r=$(req -H "Authorization: Bearer ${TOKEN_OP%?}$NUEVO" "$API/api/equipos"); check "GET /api/equipos con token alterado" 401 "${r##*|}" "${r%|*}"

echo -e "${A}=== 11. Login de ADMINISTRADOR y acceso a /api/admin ===${N}"
r=$(req -X POST "$API/api/auth/login" -H 'Content-Type: application/json' -d '{"email":"admin@rentamax.pe","password":"Admin2026"}')
TOKEN_AD=$(echo "${r%|*}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
r=$(req -H "Authorization: Bearer $TOKEN_AD" "$API/api/admin/usuarios"); check "GET /api/admin/usuarios como ADMINISTRADOR" 200 "${r##*|}" "${r%|*}"
