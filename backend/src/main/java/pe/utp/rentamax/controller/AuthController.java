package pe.utp.rentamax.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.utp.rentamax.dto.AuthResponse;
import pe.utp.rentamax.dto.LoginRequest;
import pe.utp.rentamax.dto.RegistroRequest;
import pe.utp.rentamax.dto.UsuarioResponse;
import pe.utp.rentamax.service.AuthService;

/**
 * CAPA CONTROLADOR: solo recibe HTTP, valida con @Valid y delega al servicio.
 * Rutas PUBLICAS (permitAll en SecurityConfig): sin ellas nadie podria obtener su token.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody RegistroRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}
