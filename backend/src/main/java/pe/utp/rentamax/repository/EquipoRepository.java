package pe.utp.rentamax.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.utp.rentamax.model.Equipo;

import java.util.List;

public interface EquipoRepository extends JpaRepository<Equipo, Integer> {
    boolean existsByCodigo(String codigo);
    boolean existsByCodigoAndIdNot(String codigo, Integer id);
    List<Equipo> findByEstadoOrderByCodigo(String estado);
    List<Equipo> findAllByOrderByCodigo();
}
