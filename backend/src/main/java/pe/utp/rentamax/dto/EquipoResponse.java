package pe.utp.rentamax.dto;

import pe.utp.rentamax.model.Equipo;

public record EquipoResponse(Integer id, String codigo, String nombre, Integer categoriaId, String categoria,
                             String estado, Integer stockDisponible, Integer stockMinimo, boolean stockBajo) {
    public static EquipoResponse desde(Equipo e) {
        return new EquipoResponse(e.getId(), e.getCodigo(), e.getNombre(),
                e.getCategoria().getId(), e.getCategoria().getNombre(), e.getEstado(),
                e.getStockDisponible(), e.getStockMinimo(),
                e.getStockDisponible() <= e.getStockMinimo());
    }
}
