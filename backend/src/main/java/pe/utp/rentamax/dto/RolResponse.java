package pe.utp.rentamax.dto;

import pe.utp.rentamax.model.Rol;

public record RolResponse(Integer id, String nombre, boolean permisosAltaEquipo, boolean permisosVerDocCompleto) {
    public static RolResponse desde(Rol r) {
        return new RolResponse(r.getId(), r.getNombre(), r.isPermisosAltaEquipo(), r.isPermisosVerDocCompleto());
    }
}
