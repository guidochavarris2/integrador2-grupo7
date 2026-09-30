package pe.utp.rentamax.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pe.utp.rentamax.model.Usuario;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Genera y valida JWT (Header.Payload.Signature).
 * Payload de ejemplo: { "sub": "admin@rentamax.pe", "role": "ADMINISTRADOR", "iat": ..., "exp": ... }
 * La firma HMAC-SHA256 con la clave secreta impide que alguien edite el payload
 * (por ejemplo, cambiar "OPERADOR" por "ADMINISTRADOR"): si lo hace, la firma ya no coincide.
 */
@Service
public class JwtService {

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
                .subject(usuario.getEmail())
                .claim("role", usuario.getRol().name())
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    /**
     * Verifica firma y expiracion. Si el token fue alterado, esta vencido o es basura,
     * lanza JwtException y el filtro lo trata como "no autenticado".
     */
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
