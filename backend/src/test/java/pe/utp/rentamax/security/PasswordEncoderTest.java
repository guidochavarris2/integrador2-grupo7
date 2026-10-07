package pe.utp.rentamax.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas unitarias del hashing BCrypt (coste 10), tal como lo configura SecurityConfig.
 * La contrasena es un valor de prueba aleatorio-neutro, no una credencial real del sistema.
 */
class PasswordEncoderTest {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
    private static final String CLAVE_DE_PRUEBA = "ClavePrueba123";

    @Test
    @DisplayName("El hash tiene el formato $2a$10$ + 53 caracteres (salt 22 + hash 31) y nunca es el texto plano")
    void formatoDelHash() {
        String hash = encoder.encode(CLAVE_DE_PRUEBA);
        assertTrue(hash.startsWith("$2a$10$"), "Debe iniciar con version y coste");
        assertEquals(60, hash.length());
        assertEquals(53, hash.substring(7).length());
        assertNotEquals(CLAVE_DE_PRUEBA, hash);
    }

    @Test
    @DisplayName("Dos hashes de la misma contrasena son distintos (sal aleatoria)")
    void saltAleatorio() {
        assertNotEquals(encoder.encode(CLAVE_DE_PRUEBA), encoder.encode(CLAVE_DE_PRUEBA));
    }

    @Test
    @DisplayName("matches() acepta la clave correcta y rechaza la incorrecta")
    void matchesValida() {
        String hash = encoder.encode(CLAVE_DE_PRUEBA);
        assertTrue(encoder.matches(CLAVE_DE_PRUEBA, hash));
        assertFalse(encoder.matches("ClaveIncorrecta1", hash));
    }

    @Test
    @DisplayName("Un hash NO se acepta como si fuera la contrasena (no se puede iniciar sesion con el hash)")
    void elHashNoSirveComoClave() {
        String hash = encoder.encode(CLAVE_DE_PRUEBA);
        assertFalse(encoder.matches(hash, hash));
    }
}
