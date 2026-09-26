package pe.utp.rentamax.dto;

import pe.utp.rentamax.model.Usuario;

/**
 * DTO de salida: lo que el API muestra de un usuario.
 * Nunca se devuelve la entidad directamente, para no exponer el hash de la contrasena.
 */
public record UsuarioResponse(Long id, String nombre, String email, String rol, boolean activo) {
    public static UsuarioResponse desde(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getRol().name(), u.isActivo());
    }
}
