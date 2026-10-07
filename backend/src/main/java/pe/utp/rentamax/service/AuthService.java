package pe.utp.rentamax.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

import java.util.Locale;

/**
 * CAPA SERVICIO: reglas de negocio de autenticacion. Las dependencias llegan por constructor
 * (Inyeccion de Dependencias): no hace "new", Spring entrega los objetos ya listos.
 */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
                       BCryptPasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UsuarioResponse registrar(RegistroRequest req) {
        String correo = req.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya esta registrado");
        }
        // Todo registro publico nace como OPERADOR; solo un administrador podria elevar roles.
        Rol operador = rolRepository.findByNombre(Roles.OPERADOR)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Configuracion incompleta: falta el rol OPERADOR"));
        // BCrypt: "Clave2026" -> "$2a$10$N9qo8uLOickgx2ZMRZoMye..." (distinto cada vez por la sal)
        String hash = passwordEncoder.encode(req.password());
        Usuario nuevo = new Usuario(req.nombre().trim(), correo, hash, operador);
        return UsuarioResponse.desde(usuarioRepository.save(nuevo));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String correo = req.email().trim().toLowerCase(Locale.ROOT);
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);
        // Mismo mensaje si el correo no existe o si la clave falla:
        // asi un atacante no puede averiguar que correos estan registrados.
        if (usuario == null || !passwordEncoder.matches(req.password(), usuario.getContrasenaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas");
        }
        String token = jwtService.generarToken(usuario);
        return new AuthResponse(token, "Bearer", jwtService.getExpiracionSegundos(),
                usuario.getCorreo(), usuario.getRol().getNombre(),
                JwtService.permisosDe(usuario.getRol()));
    }
}
