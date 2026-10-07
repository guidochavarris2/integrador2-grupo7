package pe.utp.rentamax.dto;

import pe.utp.rentamax.model.Categoria;

public record CategoriaResponse(Integer id, String nombre) {
    public static CategoriaResponse desde(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNombre());
    }
}
