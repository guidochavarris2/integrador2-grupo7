SELECT 'rol' AS tabla, COUNT(*) AS filas FROM rentamax.rol
UNION ALL SELECT 'usuario', COUNT(*) FROM rentamax.usuario
UNION ALL SELECT 'categoria', COUNT(*) FROM rentamax.categoria
UNION ALL SELECT 'equipo', COUNT(*) FROM rentamax.equipo
UNION ALL SELECT 'cliente', COUNT(*) FROM rentamax.cliente
UNION ALL SELECT 'alquiler', COUNT(*) FROM rentamax.alquiler
UNION ALL SELECT 'devolucion', COUNT(*) FROM rentamax.devolucion;

SELECT nombre FROM rentamax.categoria;
-- Evidencia: las contraseñas se guardan solo como hash BCrypt
SELECT correo, LEFT(contrasena_hash, 29) AS hash_bcrypt, LENGTH(contrasena_hash) AS largo FROM rentamax.usuario;