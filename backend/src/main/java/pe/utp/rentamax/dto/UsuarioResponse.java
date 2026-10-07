package pe.utp.rentamax.dto;

import pe.utp.rentamax.model.Usuario;

/**
 * DTO de salida: lo que el API muestra de un usuario.
 * Nunca se devuelve la entidad directamente, para no exponer contrasena_hash.
 */
public record UsuarioResponse(Integer id, String nombre, String email, String rol) {
    public static UsuarioResponse desde(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getCorreo(), u.getRol().getNombre());
    }
}
