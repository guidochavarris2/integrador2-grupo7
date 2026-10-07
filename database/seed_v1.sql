-- =====================================================================
-- RentaMax — Datos de demostración (poblado) · seed_v1.sql
-- Ejecutar DESPUÉS de schema_v1.sql. Es IDEMPOTENTE: se puede correr varias
-- veces sin duplicar filas (INSERT IGNORE + claves UNIQUE).
-- Las contraseñas están guardadas como hash BCrypt ($2a$10$...), nunca en claro.
--
-- Cuentas de DEMOSTRACIÓN (las mismas del front-end de Vercel):
--   admin@rentamax.pe            ADMINISTRADOR
--   ana.silva@rentamax.pe        SUPERVISOR
--   carlos.mendoza@rentamax.pe   OPERADOR
-- Las contraseñas NO se escriben en el repositorio: se entregan en el informe del APF2.
-- Cada usuario tiene su propio hash: BCrypt añade una sal aleatoria, asi que dos cuentas
-- con la misma contraseña NO comparten el mismo hash.
-- En un entorno real estas contraseñas se cambian.
-- =====================================================================
SET NAMES utf8mb4;
USE rentamax;

-- Roles y permisos (los permisos viajan dentro del JWT y gobiernan la autorización)
INSERT IGNORE INTO rol (nombre, permisos_alta_equipo, permisos_ver_doc_completo) VALUES
  ('ADMINISTRADOR', TRUE,  TRUE),
  ('SUPERVISOR',    TRUE,  TRUE),
  ('OPERADOR',      FALSE, FALSE);

-- Usuarios
INSERT IGNORE INTO usuario (nombre, correo, contrasena_hash, rol_id)
  SELECT 'Administrador RentaMax', 'admin@rentamax.pe', '$2a$10$YPLH0VAJtgmwocottAwRYeOi/Z6zsUGFMcVYnpfYzmkFE2Z8xg.qC', id FROM rol WHERE nombre = 'ADMINISTRADOR';
INSERT IGNORE INTO usuario (nombre, correo, contrasena_hash, rol_id)
  SELECT 'Ana Silva', 'ana.silva@rentamax.pe', '$2a$10$NVUOYq39Yvinrqem00l4IuGLazEWjil2vVf2o7tvXlFWbdME.x1AO', id FROM rol WHERE nombre = 'SUPERVISOR';
INSERT IGNORE INTO usuario (nombre, correo, contrasena_hash, rol_id)
  SELECT 'Carlos Mendoza', 'carlos.mendoza@rentamax.pe', '$2a$10$etbgBN0xIwn12lSW5p9bmOjcPj4DzVFztUTMXYtW.SNR1HFTpQKyK', id FROM rol WHERE nombre = 'OPERADOR';

-- Categorías
INSERT IGNORE INTO categoria (nombre) VALUES
  ('Andamios y encofrados'), ('Compactación'), ('Concreto y mezcla'),
  ('Demolición'), ('Herramientas eléctricas'), ('Generadores y compresores');

-- Equipos (el estado coincide con los alquileres activos de más abajo)
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-001','Mezcladora de concreto 9p3', id,'DISPONIBLE',4,1 FROM categoria WHERE nombre='Concreto y mezcla';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-002','Andamio tubular 1.5 m', id,'ALQUILADO',12,5 FROM categoria WHERE nombre='Andamios y encofrados';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-003','Martillo demoledor 30 kg', id,'MANTENIMIENTO',0,1 FROM categoria WHERE nombre='Demolición';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-004','Placa compactadora 90 kg', id,'DISPONIBLE',3,1 FROM categoria WHERE nombre='Compactación';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-005','Rodillo compactador 1 t', id,'DISPONIBLE',1,1 FROM categoria WHERE nombre='Compactación';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-006','Vibrador de concreto 2 pulgadas', id,'DISPONIBLE',6,2 FROM categoria WHERE nombre='Concreto y mezcla';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-007','Generador eléctrico 5 kW', id,'ALQUILADO',2,1 FROM categoria WHERE nombre='Generadores y compresores';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-008','Compresor de aire 100 L', id,'DISPONIBLE',2,1 FROM categoria WHERE nombre='Generadores y compresores';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-009','Taladro rotomartillo SDS', id,'DISPONIBLE',8,3 FROM categoria WHERE nombre='Herramientas eléctricas';
INSERT IGNORE INTO equipo (codigo, nombre, categoria_id, estado, stock_disponible, stock_minimo)
  SELECT 'EQ-010','Amoladora angular 7 pulgadas', id,'BAJA',0,2 FROM categoria WHERE nombre='Herramientas eléctricas';

-- Clientes (el documento se guarda ya enmascarado)
INSERT IGNORE INTO cliente (nombre, documento_enmascarado, telefono) VALUES
  ('Constructora Andina S.A.C.',       '20*****4561', '987654321'),
  ('Inversiones Barranca E.I.R.L.',    '20*****1182', '956123478'),
  ('Juan Pérez Quispe',                '45****12',    '999888777'),
  ('Servicios Pativilca S.R.L.',       '20*****7730', '945221867');

-- Alquileres
INSERT IGNORE INTO alquiler (codigo, equipo_id, cliente_id, usuario_id, fecha_inicio, fecha_pactada_devolucion, estado)
  SELECT 'ALQ-0001', e.id, c.id, u.id, '2026-09-28', '2026-10-12', 'ACTIVO'
  FROM equipo e, cliente c, usuario u
  WHERE e.codigo='EQ-002' AND c.documento_enmascarado='20*****4561' AND u.correo='carlos.mendoza@rentamax.pe';
INSERT IGNORE INTO alquiler (codigo, equipo_id, cliente_id, usuario_id, fecha_inicio, fecha_pactada_devolucion, estado)
  SELECT 'ALQ-0002', e.id, c.id, u.id, '2026-09-15', '2026-09-20', 'DEVUELTO'
  FROM equipo e, cliente c, usuario u
  WHERE e.codigo='EQ-008' AND c.documento_enmascarado='45****12' AND u.correo='ana.silva@rentamax.pe';
INSERT IGNORE INTO alquiler (codigo, equipo_id, cliente_id, usuario_id, fecha_inicio, fecha_pactada_devolucion, estado)
  SELECT 'ALQ-0003', e.id, c.id, u.id, '2026-09-30', '2026-10-07', 'ACTIVO'
  FROM equipo e, cliente c, usuario u
  WHERE e.codigo='EQ-007' AND c.documento_enmascarado='20*****7730' AND u.correo='carlos.mendoza@rentamax.pe';

-- Devolución del alquiler ya cerrado
INSERT IGNORE INTO devolucion (alquiler_id, fecha_real, estado_equipo, mora_calculada, observaciones)
  SELECT id, '2026-09-19', 'BUEN ESTADO', 0.00, 'Devuelto un día antes de lo pactado' FROM alquiler WHERE codigo='ALQ-0002';
