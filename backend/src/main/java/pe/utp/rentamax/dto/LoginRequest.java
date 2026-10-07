package pe.utp.rentamax.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** DTO de entrada para iniciar sesion. */
public record LoginRequest(
        @NotBlank(message = "El correo es obligatorio") @Email(message = "Formato de correo invalido") String email,
        @NotBlank(message = "La contrasena es obligatoria") String password
) { }
