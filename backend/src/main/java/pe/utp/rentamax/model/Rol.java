package pe.utp.rentamax.model;

/**
 * Perfiles de RentaMax para el control RBAC.
 * Spring Security los usa con el prefijo ROLE_ (ej. ROLE_ADMINISTRADOR),
 * por eso en SecurityConfig basta con hasRole("ADMINISTRADOR").
 */
public enum Rol {
    ADMINISTRADOR,
    SUPERVISOR,
    OPERADOR
}
