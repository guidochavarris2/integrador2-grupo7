package pe.utp.rentamax.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import pe.utp.rentamax.security.JwtAuthFilter;
import pe.utp.rentamax.security.JwtService;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // habilita @PreAuthorize en los controladores (segunda capa de RBAC)
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Hashes irreversibles con sal aleatoria (OWASP A02).
     * Coste 10 explicito = 2^10 = 1024 iteraciones; el hash guardado se ve asi: $2a$10$ + salt (22) + hash (31).
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /** Blindaje de endpoints. Las reglas se evaluan de arriba hacia abajo. */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())                 // API con JWT en header, no cookies
                .cors(Customizer.withDefaults())              // usa corsConfigurationSource()
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/health", "/error").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMINISTRADOR")
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        // 401: no se sabe quien eres (sin token / token invalido / vencido)
                        .authenticationEntryPoint((req, res, e) ->
                                escribirError(res, 401, "No autenticado: token ausente, invalido o expirado"))
                        // 403: se sabe quien eres, pero tu rol no alcanza
                        .accessDeniedHandler((req, res, e) ->
                                escribirError(res, 403, "Acceso denegado: tu rol no tiene permiso para este recurso")))
                // Nuestro filtro JWT va ANTES del filtro estandar de usuario/contrasena
                .addFilterBefore(new JwtAuthFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /** CORS: solo los dominios del front-end de RentaMax pueden consumir el API desde el navegador. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String[] origenes,
            @Value("${app.cors.allowed-origin-patterns:}") String[] patrones) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(origenes).map(String::trim).filter(s -> !s.isEmpty()).toList());
        List<String> pat = Arrays.stream(patrones).map(String::trim).filter(s -> !s.isEmpty()).toList();
        if (!pat.isEmpty()) {
            config.setAllowedOriginPatterns(pat);
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    private static void escribirError(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"error\":\"" + mensaje + "\"}");
    }
}
