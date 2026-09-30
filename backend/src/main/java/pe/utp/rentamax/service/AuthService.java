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
import pe.utp.rentamax.model.Usuario;
import pe.utp.rentamax.repository.UsuarioRepository;
import pe.utp.rentamax.security.JwtService;

import java.util.Locale;

/**
 * CAPA SERVICIO: reglas de negocio de autenticacion.
 * Recibe sus dependencias por constructor (Inyeccion de Dependencias):
 * no hace "new", Spring le entrega los objetos ya listos.
 */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UsuarioResponse registrar(RegistroRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya esta registrado");
        }
        // BCrypt: "Clave2026" -> "$2a$10$N9qo8uLOickgx2ZMRZoMye..." (distinto cada vez por la sal)
        String hash = passwordEncoder.encode(req.password());

        // Todo registro publico nace como OPERADOR; solo un admin podria elevar roles.
        Usuario nuevo = new Usuario(req.nombre().trim(), email, hash, Rol.OPERADOR);
        return UsuarioResponse.desde(usuarioRepository.save(nuevo));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        // Mismo mensaje si el correo no existe o si la clave falla:
        // asi un atacante no puede averiguar que correos estan registrados.
        if (usuario == null || !usuario.isActivo()
                || !passwordEncoder.matches(req.password(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas");
        }

        String token = jwtService.generarToken(usuario);
        return new AuthResponse(token, "Bearer", jwtService.getExpiracionSegundos(),
                usuario.getEmail(), usuario.getRol().name());
    }
}
