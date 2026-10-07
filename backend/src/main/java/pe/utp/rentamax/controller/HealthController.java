package pe.utp.rentamax.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Chequeo de salud PUBLICO: confirma que la API esta viva y que la base de datos responde.
 * Sirve para despertar el servicio en Render antes de la demostracion y como health check.
 * No expone datos sensibles.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> estado() {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("servicio", "rentamax-backend");
        cuerpo.put("hora", Instant.now().toString());
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            cuerpo.put("estado", "UP");
            cuerpo.put("baseDatos", "UP");
            return ResponseEntity.ok(cuerpo);
        } catch (Exception e) {
            cuerpo.put("estado", "DOWN");
            cuerpo.put("baseDatos", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(cuerpo);
        }
    }
}
