package pe.utp.rentamax.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import pe.utp.rentamax.dto.AuthResponse;
import pe.utp.rentamax.dto.LoginRequest;
import pe.utp.rentamax.dto.RegistroRequest;
import pe.utp.rentamax.dto.UsuarioResponse;
import pe.utp.rentamax.model.Rol;
import pe.utp.rentamax.model.Roles;
import pe.utp.rentamax.model.Usuario;
import pe.utp.rentamax.repository.RolRepository;
import pe.utp.rentamax.repository.UsuarioRepository;
import pe.utp.rentamax.security.JwtService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias de AuthService con JUnit 5 + Mockito.
 * Los repositorios se SIMULAN (@Mock): no hay base de datos. El BCrypt y el servicio son reales.
 * Patron GIVEN / WHEN / THEN.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String CLAVE_DE_PRUEBA = "ClavePrueba123";

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private RolRepository rolRepository;
    @Mock private JwtService jwtService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
    private AuthService authService;

    @BeforeEach
    void preparar() {
        authService = new AuthService(usuarioRepository, rolRepository, encoder, jwtService);
    }

    private Usuario usuarioConClave(String correo, String clave, String rol) {
        return new Usuario("Usuario Prueba", correo, encoder.encode(clave), new Rol(rol, false, false));
    }

    // ---------------- registrar ----------------

    @Test
    @DisplayName("Registro valido: se guarda el hash BCrypt ($2a$10$), nunca la contrasena en claro, y el rol es OPERADOR")
    void registrarGuardaHashYRolOperador() {
        when(usuarioRepository.existsByCorreo("nuevo@rentamax.pe")).thenReturn(false);
        when(rolRepository.findByNombre(Roles.OPERADOR)).thenReturn(Optional.of(new Rol(Roles.OPERADOR, false, false)));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponse resp = authService.registrar(
                new RegistroRequest("Usuario Nuevo", "  NUEVO@rentamax.pe ", CLAVE_DE_PRUEBA));

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        Usuario guardado = captor.getValue();
        assertTrue(guardado.getContrasenaHash().startsWith("$2a$10$"));
        assertNotEquals(CLAVE_DE_PRUEBA, guardado.getContrasenaHash());
        assertEquals("nuevo@rentamax.pe", guardado.getCorreo(), "El correo se normaliza (minusculas, sin espacios)");
        assertEquals(Roles.OPERADOR, resp.rol());
    }

    @Test
    @DisplayName("Registro con correo repetido: 409 Conflict y no se guarda nada")
    void registrarCorreoDuplicado() {
        when(usuarioRepository.existsByCorreo("repetido@rentamax.pe")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                authService.registrar(new RegistroRequest("Usuario", "repetido@rentamax.pe", CLAVE_DE_PRUEBA)));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    // ---------------- login ----------------

    @Test
    @DisplayName("Login correcto: devuelve el token JWT, el rol y los permisos")
    void loginCorrecto() {
        Usuario u = usuarioConClave("operador@rentamax.pe", CLAVE_DE_PRUEBA, Roles.OPERADOR);
        when(usuarioRepository.findByCorreo("operador@rentamax.pe")).thenReturn(Optional.of(u));
        when(jwtService.generarToken(u)).thenReturn("token.simulado.jwt");
        when(jwtService.getExpiracionSegundos()).thenReturn(3600L);

        AuthResponse resp = authService.login(new LoginRequest("operador@rentamax.pe", CLAVE_DE_PRUEBA));

        assertEquals("token.simulado.jwt", resp.token());
        assertEquals("Bearer", resp.tipo());
        assertEquals(Roles.OPERADOR, resp.rol());
        assertEquals(List.of(), resp.permisos());
    }

    @Test
    @DisplayName("Login con clave incorrecta: 401 y no se genera token")
    void loginClaveIncorrecta() {
        Usuario u = usuarioConClave("operador@rentamax.pe", CLAVE_DE_PRUEBA, Roles.OPERADOR);
        when(usuarioRepository.findByCorreo("operador@rentamax.pe")).thenReturn(Optional.of(u));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                authService.login(new LoginRequest("operador@rentamax.pe", "ClaveIncorrecta1")));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verify(jwtService, never()).generarToken(any());
    }

    @Test
    @DisplayName("Login con correo inexistente: mismo 401 y mismo mensaje (no revela que correos existen)")
    void loginCorreoInexistente() {
        when(usuarioRepository.findByCorreo("nadie@rentamax.pe")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                authService.login(new LoginRequest("nadie@rentamax.pe", CLAVE_DE_PRUEBA)));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Credenciales invalidas", ex.getReason());
    }

    @Test
    @DisplayName("Intento de inyeccion SQL en el correo: se trata como un texto cualquiera y responde 401")
    void loginConInyeccionSql() {
        // En minusculas porque el servicio normaliza el correo (trim + toLowerCase) antes de consultar.
        String ataque = "admin' or '1'='1";
        when(usuarioRepository.findByCorreo(ataque)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                authService.login(new LoginRequest(ataque, "cualquiera")));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}
