package pe.utp.rentamax.model;

import jakarta.persistence.*;

/** Entidad de la tabla "categoria". */
@Entity
@Table(name = "categoria")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    public Categoria() { }

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
}
