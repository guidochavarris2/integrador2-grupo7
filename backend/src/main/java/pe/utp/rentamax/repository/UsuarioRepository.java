package pe.utp.rentamax.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.utp.rentamax.model.Usuario;

import java.util.Optional;

/**
 * CAPA REPOSITORIO: Spring Data genera las consultas a partir del nombre del metodo,
 * SIEMPRE como Prepared Statements (SELECT ... WHERE correo = ?). El valor viaja como
 * parametro, nunca concatenado -> se bloquea "admin' OR '1'='1" (OWASP A03).
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
    boolean existsByRolNombre(String nombreRol);
}
