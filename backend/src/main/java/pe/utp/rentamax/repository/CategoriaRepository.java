package pe.utp.rentamax.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.utp.rentamax.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> { }
