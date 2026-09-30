package pe.utp.rentamax.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.utp.rentamax.dto.UsuarioResponse;
import pe.utp.rentamax.repository.UsuarioRepository;

import java.util.List;

/**
 * Endpoint ADMINISTRATIVO (RBAC). Doble candado = Defensa en Profundidad:
 *   1) SecurityConfig: /api/admin/** -> hasRole("ADMINISTRADOR")
 *   2) @PreAuthorize en el metodo (si alguien borra la regla 1, esta sigue protegiendo)
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UsuarioRepository usuarioRepository;

    public AdminController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/usuarios")
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::desde).toList();
    }
}
