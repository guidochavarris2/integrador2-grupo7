package pe.utp.rentamax.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import pe.utp.rentamax.model.Rol;
import pe.utp.rentamax.model.Roles;
import pe.utp.rentamax.model.Usuario;
import pe.utp.rentamax.repository.RolRepository;
import pe.utp.rentamax.repository.UsuarioRepository;

/**
 * Red de seguridad al arrancar (idempotente: se puede reiniciar sin duplicar nada):
 *  1) Garantiza que existan los 3 roles con sus permisos (si falta alguno, el registro publico fallaria).
 *  2) Si NO existe ningun ADMINISTRADOR, crea uno con las credenciales de las variables
 *     ADMIN_EMAIL / ADMIN_PASSWORD (guardado con hash BCrypt). Si no hay variables, no crea nada.
 * Los datos de demostracion completos (usuarios, equipos, clientes) estan en database/seed_v1.sql.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder encoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(RolRepository rolRepository, UsuarioRepository usuarioRepository,
                           BCryptPasswordEncoder encoder,
                           @Value("${app.admin.email:}") String adminEmail,
                           @Value("${app.admin.password:}") String adminPassword) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.encoder = encoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        asegurarRol(Roles.ADMINISTRADOR, true, true);
        asegurarRol(Roles.SUPERVISOR, true, true);
        asegurarRol(Roles.OPERADOR, false, false);

        if (!usuarioRepository.existsByRolNombre(Roles.ADMINISTRADOR)) {
            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                log.warn("No hay ADMINISTRADOR y no se definieron ADMIN_EMAIL/ADMIN_PASSWORD: no se crea ninguno.");
                return;
            }
            Rol rolAdmin = rolRepository.findByNombre(Roles.ADMINISTRADOR).orElseThrow();
            usuarioRepository.save(new Usuario("Administrador RentaMax",
                    adminEmail.trim().toLowerCase(), encoder.encode(adminPassword), rolAdmin));
            log.info("Administrador inicial creado: {}", adminEmail);
        }
    }

    private void asegurarRol(String nombre, boolean altaEquipo, boolean verDocCompleto) {
        if (rolRepository.findByNombre(nombre).isEmpty()) {
            rolRepository.save(new Rol(nombre, altaEquipo, verDocCompleto));
            log.info("Rol creado: {}", nombre);
        }
    }
}
