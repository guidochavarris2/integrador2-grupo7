package pe.utp.rentamax.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import pe.utp.rentamax.model.Rol;
import pe.utp.rentamax.model.Usuario;
import pe.utp.rentamax.repository.UsuarioRepository;

/**
 * Al arrancar, crea el ADMINISTRADOR inicial si no existe (tambien con hash BCrypt).
 * Es la unica forma de tener un admin, porque el registro publico siempre crea OPERADOR.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository repo;
    private final BCryptPasswordEncoder encoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(UsuarioRepository repo, BCryptPasswordEncoder encoder,
                           @Value("${app.admin.email}") String adminEmail,
                           @Value("${app.admin.password}") String adminPassword) {
        this.repo = repo;
        this.encoder = encoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (!repo.existsByEmail(adminEmail)) {
            repo.save(new Usuario("Administrador RentaMax", adminEmail, encoder.encode(adminPassword), Rol.ADMINISTRADOR));
            log.info("Administrador inicial creado: {}", adminEmail);
        }
    }
}
