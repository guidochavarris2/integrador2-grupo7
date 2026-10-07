package pe.utp.rentamax.dto;

import jakarta.validation.constraints.*;

/**
 * DTO de entrada para crear/actualizar un equipo. Las anotaciones validan en el back-end
 * (defensa contra XSS e inyecciones): si algo no cumple, se responde 400 antes de tocar la BD.
 */
public record EquipoRequest(
        @NotBlank(message = "El codigo es obligatorio")
        @Pattern(regexp = "^[A-Z]{2,4}-\\d{3,6}$", message = "Formato de codigo invalido (ej. EQ-001)")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "Maximo 100 caracteres")
        @Pattern(regexp = "^[\\p{L}\\p{N} .,'()/%+-]+$", message = "El nombre contiene caracteres no permitidos")
        String nombre,

        @NotNull(message = "La categoria es obligatoria")
        Integer categoriaId,

        @NotBlank(message = "El estado es obligatorio")
        @Pattern(regexp = "^(DISPONIBLE|ALQUILADO|MANTENIMIENTO|BAJA)$",
                 message = "Estado invalido (DISPONIBLE, ALQUILADO, MANTENIMIENTO o BAJA)")
        String estado,

        @NotNull(message = "El stock disponible es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stockDisponible,

        @NotNull(message = "El stock minimo es obligatorio")
        @Min(value = 0, message = "El stock minimo no puede ser negativo")
        Integer stockMinimo
) { }
