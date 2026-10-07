package pe.utp.rentamax.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.utp.rentamax.dto.EquipoRequest;
import pe.utp.rentamax.dto.EquipoResponse;
import pe.utp.rentamax.service.EquipoService;

import java.net.URI;
import java.util.List;
import java.util.Set;

/**
 * CAPA CONTROLADOR del inventario. Autorizacion por permisos que vienen de la tabla "rol":
 *   - Leer (GET): cualquier usuario autenticado (OPERADOR, SUPERVISOR, ADMINISTRADOR)
 *   - Crear/editar: permiso ALTA_EQUIPO (SUPERVISOR y ADMINISTRADOR)
 *   - Eliminar: solo ADMINISTRADOR
 */
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    private static final Set<String> ESTADOS = Set.of("DISPONIBLE", "ALQUILADO", "MANTENIMIENTO", "BAJA");

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @GetMapping
    public List<EquipoResponse> listar(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isBlank() && !ESTADOS.contains(estado)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado invalido");
        }
        return equipoService.listar(estado);
    }

    @GetMapping("/{id}")
    public EquipoResponse obtener(@PathVariable Integer id) {
        return equipoService.obtener(id);
    }

    @PreAuthorize("hasAuthority('PERM_ALTA_EQUIPO')")
    @PostMapping
    public ResponseEntity<EquipoResponse> crear(@Valid @RequestBody EquipoRequest req) {
        EquipoResponse creado = equipoService.crear(req);
        return ResponseEntity.created(URI.create("/api/equipos/" + creado.id())).body(creado);
    }

    @PreAuthorize("hasAuthority('PERM_ALTA_EQUIPO')")
    @PutMapping("/{id}")
    public EquipoResponse actualizar(@PathVariable Integer id, @Valid @RequestBody EquipoRequest req) {
        return equipoService.actualizar(id, req);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        equipoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
