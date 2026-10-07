package pe.utp.rentamax.model;

import jakarta.persistence.*;

/** Entidad de la tabla "cliente". El documento se guarda ya enmascarado (45****12). */
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "documento_enmascarado", nullable = false, unique = true, length = 20)
    private String documentoEnmascarado;

    @Column(length = 20)
    private String telefono;

    public Cliente() { }

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public String getDocumentoEnmascarado() { return documentoEnmascarado; }
    public String getTelefono() { return telefono; }
}
