package pe.utp.rentamax.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.utp.rentamax.model.Usuario;

import java.util.Optional;

/**
 * CAPA REPOSITORIO (patron Repository): acceso a datos sin escribir SQL.
 * Spring Data genera las consultas a partir del nombre del metodo, y SIEMPRE
 * como Prepared Statements:  SELECT ... WHERE email = ?
 * El valor viaja como parametro, nunca concatenado -> se bloquea "admin' OR '1'='1" (OWASP A03).
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
}
