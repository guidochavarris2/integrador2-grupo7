package pe.utp.rentamax.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Endpoint de negocio PROTEGIDO: cualquier rol con token valido (anyRequest().authenticated()).
 * Por ahora devuelve datos de ejemplo; en el Sprint 3 se conectara a la entidad Equipo.
 */
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    @GetMapping
    public Map<String, Object> listar(Authentication auth) {
        List<Map<String, Object>> equipos = List.of(
                Map.of("codigo", "EQ-001", "nombre", "Mezcladora de concreto 9p3", "estado", "DISPONIBLE"),
                Map.of("codigo", "EQ-002", "nombre", "Andamio tubular 1.5 m", "estado", "ALQUILADO"),
                Map.of("codigo", "EQ-003", "nombre", "Martillo demoledor 30 kg", "estado", "MANTENIMIENTO"));
        return Map.of(
                "usuario", auth.getName(),            // sale del "sub" del token
                "rol", auth.getAuthorities().toString(),
                "equipos", equipos);
    }
}
