#!/usr/bin/env bash
# =====================================================================
# RentaMax — Prueba de rendimiento y concurrencia (pruebas NO funcionales)
# Uso:   ./rendimiento.sh [peticiones] [concurrentes]        (por defecto 100 y 10)
# Uso:   BASE_URL=https://TU-SERVICIO.onrender.com RM_PASS=... ./rendimiento.sh 200 20
#        (la clave NO esta en el repositorio; RM_EMAIL opcional, por defecto el operador de demo)
# Lanza GET /api/equipos con un token valido, en paralelo, y resume latencias.
# Requiere bash, curl, xargs y awk (en Windows: Git Bash).
# =====================================================================
BASE="${BASE_URL:?Define BASE_URL con la URL publica HTTPS del servicio}"
N="${1:-100}"; C="${2:-10}"
EMAIL="${RM_EMAIL:-carlos.mendoza@rentamax.pe}"; PASS="${RM_PASS:?Define RM_PASS}"

TOKEN="$(curl -s -m 30 -X POST -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" "$BASE/api/auth/login" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"
[ -z "$TOKEN" ] && { echo "No se pudo iniciar sesion en $BASE"; exit 1; }

TMP="$(mktemp)"
echo "== $N peticiones, $C en paralelo, contra $BASE/api/equipos"
INI=$(date +%s.%N 2>/dev/null || date +%s)
seq 1 "$N" | xargs -P "$C" -I{} curl -s -o /dev/null -m 60 -w '%{http_code} %{time_total}\n' \
  -H "Authorization: Bearer $TOKEN" "$BASE/api/equipos" > "$TMP"
FIN=$(date +%s.%N 2>/dev/null || date +%s)

TOTAL=$(wc -l < "$TMP"); OKS=$(grep -c '^200 ' "$TMP")
awk '{print $2*1000}' "$TMP" | sort -n > "$TMP.t"
P50=$(awk -v n="$TOTAL" 'NR==int(n*0.50)+1{printf "%.0f",$1}' "$TMP.t")
P95=$(awk -v n="$TOTAL" 'NR==int(n*0.95)+1{printf "%.0f",$1}' "$TMP.t")
MAX=$(tail -1 "$TMP.t" | awk '{printf "%.0f",$1}')
PROM=$(awk '{s+=$1} END{printf "%.0f", s/NR}' "$TMP.t")
DUR=$(awk -v a="$INI" -v b="$FIN" 'BEGIN{printf "%.2f", b-a}')
RPS=$(awk -v n="$TOTAL" -v d="$DUR" 'BEGIN{ if (d>0) printf "%.1f", n/d; else print "n/d"}')

echo "Respuestas HTTP 200 : $OKS de $TOTAL"
echo "Latencia promedio   : ${PROM} ms"
echo "Latencia p50 / p95  : ${P50} ms / ${P95} ms"
echo "Latencia maxima     : ${MAX} ms"
echo "Duracion total      : ${DUR} s  (~${RPS} peticiones/s)"
rm -f "$TMP" "$TMP.t"
[ "$OKS" -eq "$TOTAL" ] && echo "RESULTADO: OK (sin errores bajo carga)" || { echo "RESULTADO: HUBO ERRORES"; exit 1; }
