package pe.utp.rentamax.dto;

import pe.utp.rentamax.model.Cliente;

/** El documento ya esta enmascarado en BD; el telefono solo se ve completo con el permiso VER_DOC_COMPLETO. */
public record ClienteResponse(Integer id, String nombre, String documento, String telefono) {
    public static ClienteResponse desde(Cliente c, boolean verCompleto) {
        String tel = c.getTelefono();
        if (!verCompleto && tel != null && tel.length() > 3) {
            tel = "*".repeat(tel.length() - 3) + tel.substring(tel.length() - 3);
        }
        return new ClienteResponse(c.getId(), c.getNombre(), c.getDocumentoEnmascarado(), tel);
    }
}
