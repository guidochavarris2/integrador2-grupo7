package pe.utp.rentamax.dto;

import java.util.List;

/** DTO de salida del login: el token que el cliente enviara como "Authorization: Bearer <token>". */
public record AuthResponse(String token, String tipo, long expiraEnSegundos,
                           String email, String rol, List<String> permisos) { }
