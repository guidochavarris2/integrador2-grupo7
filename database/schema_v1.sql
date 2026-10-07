-- =====================================================================
-- RentaMax — Script DDL (fuente de verdad del modelo de datos)
-- Curso: Integrador II: Sistemas — Sesión 11 / usado en el APF2
-- Grupo 07 — ConstruRenta Lima S.A.C.
-- Motor: MySQL 8.0+
-- Basado en el DER aprobado (Unidad 1): Rol, Usuario, Categoría, Equipo,
-- Cliente, Alquiler, Devolución.
-- El backend (Spring Boot + JPA) usa ddl-auto=validate: NO crea tablas,
-- solo verifica que las entidades coincidan con este script.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS rentamax
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rentamax;

-- ---------------------------------------------------------------------
-- FASE 1: Tablas, claves primarias y foráneas (normalizado a 3FN)
-- ---------------------------------------------------------------------

CREATE TABLE rol (
    id                          INT AUTO_INCREMENT PRIMARY KEY,
    nombre                      VARCHAR(50)  NOT NULL,
    permisos_alta_equipo        BOOLEAN      NOT NULL DEFAULT FALSE,
    permisos_ver_doc_completo   BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_rol_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE usuario (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    correo             VARCHAR(150) NOT NULL,
    contrasena_hash    VARCHAR(255) NOT NULL,
    rol_id             INT NOT NULL,
    CONSTRAINT uq_usuario_correo UNIQUE (correo),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB;

CREATE TABLE categoria (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(60) NOT NULL,
    CONSTRAINT uq_categoria_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE equipo (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    codigo              VARCHAR(20)  NOT NULL,
    nombre              VARCHAR(100) NOT NULL,
    categoria_id        INT NOT NULL,
    estado              VARCHAR(20)  NOT NULL DEFAULT 'DISPONIBLE',
    stock_disponible    INT NOT NULL DEFAULT 0,
    stock_minimo        INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_equipo_codigo UNIQUE (codigo),
    CONSTRAINT fk_equipo_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id),
    CONSTRAINT chk_equipo_estado CHECK (estado IN ('DISPONIBLE','ALQUILADO','MANTENIMIENTO','BAJA')),
    CONSTRAINT chk_equipo_stock_disp CHECK (stock_disponible >= 0),
    CONSTRAINT chk_equipo_stock_min CHECK (stock_minimo >= 0)
) ENGINE=InnoDB;

CREATE TABLE cliente (
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    nombre                 VARCHAR(150) NOT NULL,
    documento_enmascarado  VARCHAR(20)  NOT NULL,
    telefono               VARCHAR(20),
    CONSTRAINT uq_cliente_documento UNIQUE (documento_enmascarado)
) ENGINE=InnoDB;

CREATE TABLE alquiler (
    id                          INT AUTO_INCREMENT PRIMARY KEY,
    codigo                      VARCHAR(20) NOT NULL,
    equipo_id                   INT NOT NULL,
    cliente_id                  INT NOT NULL,
    usuario_id                  INT NOT NULL,
    fecha_inicio                DATE NOT NULL,
    fecha_pactada_devolucion    DATE NOT NULL,
    estado                      VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT uq_alquiler_codigo UNIQUE (codigo),
    CONSTRAINT fk_alquiler_equipo FOREIGN KEY (equipo_id) REFERENCES equipo(id),
    CONSTRAINT fk_alquiler_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT fk_alquiler_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    CONSTRAINT chk_alquiler_estado CHECK (estado IN ('ACTIVO','DEVUELTO','ATRASADO','CANCELADO')),
    CONSTRAINT chk_alquiler_fechas CHECK (fecha_pactada_devolucion > fecha_inicio)
) ENGINE=InnoDB;

CREATE TABLE devolucion (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    alquiler_id         INT NOT NULL,
    fecha_real          DATE NOT NULL,
    estado_equipo       VARCHAR(30) NOT NULL,
    mora_calculada      DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    observaciones       VARCHAR(255),
    CONSTRAINT uq_devolucion_alquiler UNIQUE (alquiler_id),
    CONSTRAINT fk_devolucion_alquiler FOREIGN KEY (alquiler_id) REFERENCES alquiler(id),
    CONSTRAINT chk_devolucion_mora CHECK (mora_calculada >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- FASE 2: Índices B-Tree adicionales (columnas de consulta frecuente)
-- Nota: correo, documento_enmascarado, codigo y las FK ya quedan
-- indexados automáticamente por sus restricciones UNIQUE / FOREIGN KEY,
-- así que no se repiten aquí para evitar sobre-indexación.
-- ---------------------------------------------------------------------

CREATE INDEX idx_equipo_estado          ON equipo   (estado);
CREATE INDEX idx_alquiler_estado        ON alquiler (estado);
CREATE INDEX idx_alquiler_fecha_pactada ON alquiler (fecha_pactada_devolucion);
