package pe.utp.rentamax.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Eslabon propio de la cadena de filtros (patron Chain of Responsibility).
 * En CADA peticion:
 *   1. Busca el header "Authorization: Bearer <token>".
 *   2. Si el token es valido, registra al usuario y su rol en el SecurityContext.
 *   3. Si no hay token o es invalido, NO registra a nadie; mas adelante la regla
 *      .authenticated() lo rechaza con 401.
 *   4. Siempre pasa la peticion al siguiente eslabon (chain.doFilter).
 *
 * Importante: NO lleva @Component. Se crea dentro de SecurityConfig; si fuera un bean,
 * Spring Boot lo registraria dos veces (fuera y dentro de la cadena de seguridad).
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";
    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith(PREFIJO)) {
            String token = header.substring(PREFIJO.length());
            try {
                Claims claims = jwtService.validarYLeer(token);
                String email = claims.getSubject();
                String rol = claims.get("role", String.class);

                var autenticacion = new UsernamePasswordAuthenticationToken(
                        email, null, List.of(new SimpleGrantedAuthority("ROLE_" + rol)));
                SecurityContextHolder.getContext().setAuthentication(autenticacion);

            } catch (JwtException | IllegalArgumentException e) {
                // Token alterado, vencido o mal formado -> se queda sin autenticar
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }
}
