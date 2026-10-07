package pe.utp.rentamax.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Traduce errores a respuestas JSON limpias y consistentes.
 * Tambien evita filtrar trazas internas (stack traces) al cliente.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 400: fallo alguna validacion del DTO (@NotBlank, @Email, @Pattern...). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> campos.putIfAbsent(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of(
                "status", 400, "error", "Datos invalidos", "campos", campos));
    }

    /** 400: JSON mal formado. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> jsonInvalido(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of("status", 400, "error", "JSON mal formado"));
    }

    /** 400: parametro de ruta con tipo incorrecto (ej. /api/equipos/abc). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> tipoInvalido(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest().body(Map.of("status", 400, "error", "Parametro invalido"));
    }

    /** 401, 404, 409, etc. lanzados desde los servicios. */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> estado(ResponseStatusException ex) {
        int status = ex.getStatusCode().value();
        return ResponseEntity.status(status).body(Map.of(
                "status", status, "error", ex.getReason() == null ? "Error" : ex.getReason()));
    }

    /** 409: la BD rechazo la operacion (UNIQUE, FOREIGN KEY o CHECK). Segunda barrera de validacion. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridad(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "status", 409, "error", "La operacion viola una restriccion de integridad de la base de datos"));
    }

    /** 403 desde @PreAuthorize. */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> denegado(Exception ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", 403, "error", "Acceso denegado: tu rol no tiene permiso para este recurso"));
    }
}
