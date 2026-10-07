package pe.utp.rentamax.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.utp.rentamax.model.Rol;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByNombre(String nombre);
}
