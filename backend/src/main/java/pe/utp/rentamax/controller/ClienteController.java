package pe.utp.rentamax.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.utp.rentamax.dto.ClienteResponse;
import pe.utp.rentamax.repository.ClienteRepository;

import java.util.List;

/**
 * Lectura de clientes. Minimizacion de datos personales: el telefono solo se muestra completo
 * a los roles con el permiso VER_DOC_COMPLETO (columna permisos_ver_doc_completo de la tabla rol).
 */
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<ClienteResponse> listar(Authentication auth) {
        boolean verCompleto = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("PERM_VER_DOC_COMPLETO"));
        return clienteRepository.findAll().stream()
                .map(c -> ClienteResponse.desde(c, verCompleto)).toList();
    }
}
