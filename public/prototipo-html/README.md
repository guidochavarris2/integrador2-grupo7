# RentaMax — Prototipo Front-End (Sprint 1)

Sistema web de gestión de inventario, alquileres y devoluciones de equipos de construcción.
**Curso:** Integrador II: Sistemas (NRC 20199) — UTP · **Grupo:** 07

## Estructura de carpetas

```
public/prototipo-html/
├── index.html          # P01 · Login              — HU-01 / RF-01
├── dashboard.html       # P02 · Dashboard           — HU-05 / RF-11, RF-12
├── inventario.html      # P03 · Inventario          — HU-02 / RF-02, RF-05, RF-08, RF-09, RF-10
├── alquileres.html      # P04 · Registro de alquiler— HU-03 / RF-03
├── devoluciones.html    # P05 · Registro de devolución — HU-04 / RF-04 (cálculo de mora)
├── ayuda.html           # P06 · Centro de ayuda
├── css/
│   └── styles.css       # Design tokens + BEM + mobile-first (Flexbox/Grid)
└── js/
    └── app.js           # Interactividad vanilla JS (sin dependencias)
```

Esto cumple el mínimo de **5 pantallas** exigido por la Guía APF1 (Cap. 4) para la alternativa
tecnológica seleccionada, y consolida el avance Front-End de la Semana 3 con las vistas
adicionales requeridas por el SRS (Cap. 5) del Informe APF1.

## Cómo verlo

No requiere instalación ni backend: abre `public/prototipo-html/index.html` directamente en el
navegador, o publícalo con **GitHub Pages** apuntando a esa carpeta.

## Decisiones de diseño

- **HTML5 semántico:** una sola instancia de `<header>`, `<nav>`, `<main>` y `<footer>` por vista;
  el resto son `<div>` de layout (`.app-shell`, `.app-shell__main-wrap`).
- **BEM:** nomenclatura `.bloque__elemento--modificador` en todos los componentes
  (`.kpi-card__value`, `.nav__link--active`, `.status-pill--overdue`).
- **Mobile-first:** una columna en móvil, 2 columnas desde 640px, sidebar fija y KPIs a 4
  columnas desde 1024px; login pasa a dos columnas desde 900px.
- **Diseño visual:** paleta inspirada en el rubro (verde industrial + naranja de seguridad de
  obra), tipografía Space Grotesk (títulos/UI) + IBM Plex Mono (códigos de equipo/alquiler,
  valores numéricos), evitando la estética genérica "SaaS card kit".
- **Accesibilidad (RNF-08):** `aria-label` en regiones clave, `scope="col"` en tablas, foco
  visible, `prefers-reduced-motion` respetado.
- **RBAC (RF-09) y privacidad (RNF-07):** el usuario de prueba "Carlos Mendoza — Operador de
  piso" no puede dar de alta equipos (botón deshabilitado con motivo) ni ver el documento de
  identidad completo del cliente (se muestra enmascarado, ej. `72***089`).

## Datos de ejemplo (consistentes con el Informe APF1, §5.4)

| KPI | Valor |
| --- | --- |
| Equipos totales | 12 |
| Disponibles | 7 |
| Alquilados | 4 |
| Atrasados | 2 (subconjunto de alquilados) |
| En mantenimiento | 1 (EQ-004) |

## Próximos pasos técnicos

- Conectar los formularios a la API REST (Java Spring Boot) definida en el Cap. 4 del informe.
- Reemplazar los datos de ejemplo por consumo real de los endpoints de Inventario, Alquileres
  y Devoluciones.
- Integrar autenticación real (RF-01) y control de roles en el backend (RF-09).
