package pe.utp.rentamax.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Eslabon propio de la cadena de filtros (patron Chain of Responsibility). En CADA peticion:
 *   1. Busca el header "Authorization: Bearer <token>".
 *   2. Si el token es valido, registra al usuario con ROLE_<rol> y PERM_<permiso> en el SecurityContext.
 *   3. Si no hay token o es invalido, NO registra a nadie; .authenticated() lo rechaza con 401.
 *   4. Siempre pasa la peticion al siguiente eslabon (chain.doFilter).
 * No lleva @Component: se crea dentro de SecurityConfig para que no se registre dos veces.
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
                List<GrantedAuthority> autoridades = new ArrayList<>();
                autoridades.add(new SimpleGrantedAuthority("ROLE_" + claims.get("role", String.class)));
                Object perms = claims.get("perms");
                if (perms instanceof List<?> lista) {
                    for (Object p : lista) {
                        autoridades.add(new SimpleGrantedAuthority("PERM_" + p));
                    }
                }
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(claims.getSubject(), null, autoridades));
            } catch (JwtException | IllegalArgumentException e) {
                SecurityContextHolder.clearContext(); // token alterado, vencido o mal formado
            }
        }
        chain.doFilter(request, response);
    }
}
