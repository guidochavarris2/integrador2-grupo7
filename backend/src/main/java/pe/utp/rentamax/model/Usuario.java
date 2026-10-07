package pe.utp.rentamax.model;

import jakarta.persistence.*;

/**
 * Entidad de la tabla "usuario". Mapeo explicito API -> BD:
 *   email (API)    -> correo (columna)
 *   password (API) -> contrasena_hash (columna): SOLO el hash BCrypt, nunca texto plano.
 */
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "correo", nullable = false, unique = true, length = 150)
    private String correo;

    @Column(name = "contrasena_hash", nullable = false)
    private String contrasenaHash; // $2a$10$...

    // Relacion N:1 -> rol_id es la llave foranea de schema_v1.sql (fk_usuario_rol)
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    public Usuario() { }

    public Usuario(String nombre, String correo, String contrasenaHash, Rol rol) {
        this.nombre = nombre;
        this.correo = correo;
        this.contrasenaHash = contrasenaHash;
        this.rol = rol;
    }

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCorreo() { return correo; }
    public String getContrasenaHash() { return contrasenaHash; }
    public Rol getRol() { return rol; }
}
