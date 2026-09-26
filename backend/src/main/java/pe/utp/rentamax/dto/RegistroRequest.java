package pe.utp.rentamax.dto;

import jakarta.validation.constraints.*;

/**
 * DTO de entrada para registrarse. Las anotaciones validan y "sanitizan" en el back-end
 * (defensa contra XSS e inyecciones): si algo no cumple, se responde 400 antes de tocar la BD.
 * Nota: NO hay campo "rol". Si el cliente pudiera elegir su rol, cualquiera se registraria
 * como ADMINISTRADOR (escalamiento de privilegios, OWASP A01).
 */
public record RegistroRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "Maximo 100 caracteres")
        @Pattern(regexp = "^[\\p{L} .'-]+$", message = "El nombre solo admite letras, espacios y . ' -")
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Formato de correo invalido")
        @Size(max = 120)
        String email,

        @NotBlank(message = "La contrasena es obligatoria")
        @Size(min = 8, max = 64, message = "La contrasena debe tener entre 8 y 64 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "La contrasena debe tener letras y numeros")
        String password
) { }
