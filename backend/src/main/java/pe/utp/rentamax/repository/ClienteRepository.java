package pe.utp.rentamax.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.utp.rentamax.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> { }
