package pe.utp.rentamax.model;

import jakarta.persistence.*;

/**
 * CAPA MODELO. Entidad de la tabla "rol" (schema_v1.sql).
 * Los permisos ya no estan "quemados" en el codigo: viven en columnas de la BD
 * (permisos_alta_equipo, permisos_ver_doc_completo) y viajan dentro del JWT.
 */
@Entity
@Table(name = "rol")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(name = "permisos_alta_equipo", nullable = false)
    private boolean permisosAltaEquipo;

    @Column(name = "permisos_ver_doc_completo", nullable = false)
    private boolean permisosVerDocCompleto;

    public Rol() { }

    public Rol(String nombre, boolean permisosAltaEquipo, boolean permisosVerDocCompleto) {
        this.nombre = nombre;
        this.permisosAltaEquipo = permisosAltaEquipo;
        this.permisosVerDocCompleto = permisosVerDocCompleto;
    }

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public boolean isPermisosAltaEquipo() { return permisosAltaEquipo; }
    public boolean isPermisosVerDocCompleto() { return permisosVerDocCompleto; }
}
