package pe.utp.rentamax.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pe.utp.rentamax.model.Rol;
import pe.utp.rentamax.model.Usuario;

import javax.crypto.SecretKey;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Genera y valida JWT (Header.Payload.Signature).
 * Payload: { "sub": "admin@rentamax.pe", "role": "ADMINISTRADOR", "perms": ["ALTA_EQUIPO",...], "iat": ..., "exp": ... }
 * Los permisos salen de las columnas de la tabla "rol". La firma HMAC con la clave secreta impide
 * editar el payload (por ejemplo, cambiar "OPERADOR" por "ADMINISTRADOR"): la firma ya no coincide.
 * La clave debe tener al menos 256 bits; si es mas corta, el arranque falla (fail-fast).
 */
@Service
public class JwtService {

    public static final String PERM_ALTA_EQUIPO = "ALTA_EQUIPO";
    public static final String PERM_VER_DOC_COMPLETO = "VER_DOC_COMPLETO";

    private final SecretKey clave;
    private final long expiracionMs;

    public JwtService(@Value("${app.jwt.secret}") String secretoBase64,
                      @Value("${app.jwt.expiration-ms}") long expiracionMs) {
        this.clave = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretoBase64));
        this.expiracionMs = expiracionMs;
    }

    /** Patron Builder: se arma el token pieza por pieza y se firma al final. */
    public String generarToken(Usuario usuario) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(usuario.getCorreo())
                .claim("role", usuario.getRol().getNombre())
                .claim("perms", permisosDe(usuario.getRol()))
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    public static List<String> permisosDe(Rol rol) {
        List<String> perms = new ArrayList<>();
        if (rol.isPermisosAltaEquipo()) perms.add(PERM_ALTA_EQUIPO);
        if (rol.isPermisosVerDocCompleto()) perms.add(PERM_VER_DOC_COMPLETO);
        return perms;
    }

    /** Verifica firma y expiracion. Token alterado, vencido o basura -> JwtException -> "no autenticado". */
    public Claims validarYLeer(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpiracionSegundos() {
        return expiracionMs / 1000;
    }
}
