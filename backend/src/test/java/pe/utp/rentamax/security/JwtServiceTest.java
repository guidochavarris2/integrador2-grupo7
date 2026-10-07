package pe.utp.rentamax.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pe.utp.rentamax.model.Rol;
import pe.utp.rentamax.model.Roles;
import pe.utp.rentamax.model.Usuario;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas unitarias de JwtService (JUnit 5). No usan Spring ni base de datos.
 * La clave se genera al azar en cada ejecucion: el repositorio no contiene ningun secreto.
 */
class JwtServiceTest {

    private static String claveAleatoriaBase64() {
        byte[] bytes = new byte[48]; // 384 bits (minimo exigido: 256)
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private JwtService jwtService;
    private Usuario supervisora;

    @BeforeEach
    void preparar() {
        jwtService = new JwtService(claveAleatoriaBase64(), 3_600_000L);
        // El hash es solo un valor de relleno: se comprueba que NUNCA viaja dentro del token.
        supervisora = new Usuario("Ana Silva", "ana.silva@rentamax.pe", "$2a$10$hashDeRelleno",
                new Rol(Roles.SUPERVISOR, true, true));
    }

    @Test
    @DisplayName("El token tiene 3 partes: Header.Payload.Signature")
    void tokenTieneTresPartes() {
        String token = jwtService.generarToken(supervisora);
        assertEquals(3, token.split("\\.").length);
    }

    @Test
    @DisplayName("El token valido devuelve correo, rol y permisos")
    void tokenValidoDevuelveClaims() {
        Claims claims = jwtService.validarYLeer(jwtService.generarToken(supervisora));
        assertEquals("ana.silva@rentamax.pe", claims.getSubject());
        assertEquals(Roles.SUPERVISOR, claims.get("role", String.class));
        assertEquals(List.of("ALTA_EQUIPO", "VER_DOC_COMPLETO"), claims.get("perms", List.class));
        assertNotNull(claims.getExpiration());
    }

    @Test
    @DisplayName("El payload (Base64URL, no cifrado) no contiene contrasenas ni hashes")
    void payloadNoContieneDatosSensibles() {
        String token = jwtService.generarToken(supervisora);
        String payload = new String(Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);
        assertFalse(payload.toLowerCase().contains("password"));
        assertFalse(payload.toLowerCase().contains("contrasena"));
        assertFalse(payload.contains("$2a$"));
    }

    @Test
    @DisplayName("Si se altera un solo caracter del payload, la firma se invalida (401 en el API)")
    void tokenAlteradoEsRechazado() {
        String[] partes = jwtService.generarToken(supervisora).split("\\.");
        // Cambia el rol dentro del payload, manteniendo la firma original
        String payload = new String(Base64.getUrlDecoder().decode(partes[1]), StandardCharsets.UTF_8)
                .replace(Roles.SUPERVISOR, Roles.ADMINISTRADOR);
        String payloadFalso = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String tokenFalso = partes[0] + "." + payloadFalso + "." + partes[2];
        assertThrows(JwtException.class, () -> jwtService.validarYLeer(tokenFalso));
    }

    @Test
    @DisplayName("Un token firmado con otra clave es rechazado")
    void tokenConOtraClaveEsRechazado() {
        JwtService atacante = new JwtService(claveAleatoriaBase64(), 3_600_000L);
        String tokenAjeno = atacante.generarToken(supervisora);
        assertThrows(JwtException.class, () -> jwtService.validarYLeer(tokenAjeno));
    }

    @Test
    @DisplayName("Un token vencido es rechazado")
    void tokenVencidoEsRechazado() {
        String clave = claveAleatoriaBase64();
        JwtService caducado = new JwtService(clave, -1_000L); // expira un segundo antes de nacer
        String token = caducado.generarToken(supervisora);
        assertThrows(JwtException.class, () -> caducado.validarYLeer(token));
    }

    @Test
    @DisplayName("Un texto cualquiera no es un token valido")
    void basuraEsRechazada() {
        assertThrows(JwtException.class, () -> jwtService.validarYLeer("esto.no.es-un-jwt"));
    }

    @Test
    @DisplayName("Una clave de menos de 256 bits hace fallar el arranque (fail-fast)")
    void claveDebilNoArranca() {
        String claveCorta = Base64.getEncoder().encodeToString(new byte[16]); // 128 bits
        assertThrows(RuntimeException.class, () -> new JwtService(claveCorta, 3_600_000L));
    }
}
