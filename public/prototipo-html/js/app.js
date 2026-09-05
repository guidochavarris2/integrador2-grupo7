/**
 * RentaMax — app.js
 * Interactividad ligera del prototipo (sin backend / vanilla JS).
 * Cubre: validación visual de login, cálculo de mora (RF-04),
 * filtro de inventario (RF-05/RF-08), acordeón de ayuda.
 */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Login: feedback de error al enviar vacío (demo RF-01) ---------- */
  const loginForm = document.querySelector(".login__form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = loginForm.querySelector("#email");
      const password = loginForm.querySelector("#password");
      const isValid = email.value.trim() !== "" && password.value.trim() !== "";
      loginForm.dataset.state = isValid ? "" : "error";
      if (isValid) {
        window.location.href = "dashboard.html";
      }
    });
  }

  /* ---------- Inventario: filtro por texto y por estado (RF-05 / RF-08) ---------- */
  const inventoryTable = document.querySelector("[data-inventory-table]");
  const searchInput = document.querySelector("[data-inventory-search]");
  const statusSelect = document.querySelector("[data-inventory-status]");

  const filterInventory = () => {
    if (!inventoryTable) return;
    const term = (searchInput?.value || "").toLowerCase().trim();
    const status = statusSelect?.value || "todos";
    const rows = inventoryTable.querySelectorAll("tbody tr");
    let visibleCount = 0;

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const rowStatus = row.dataset.status || "";
      const matchesText = text.includes(term);
      const matchesStatus = status === "todos" || rowStatus === status;
      const visible = matchesText && matchesStatus;
      row.style.display = visible ? "" : "none";
      if (visible) visibleCount += 1;
    });

    const emptyState = document.querySelector("[data-inventory-empty]");
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }
  };

  searchInput?.addEventListener("input", filterInventory);
  statusSelect?.addEventListener("change", filterInventory);

  /* ---------- Alquileres: al elegir equipo, sugerir fecha pactada (+7 días) ---------- */
  const equipoSelect = document.querySelector("[data-alquiler-equipo]");
  const fechaInicio = document.querySelector("[data-alquiler-fecha-inicio]");
  const fechaFin = document.querySelector("[data-alquiler-fecha-fin]");

  const sugerirFechaFin = () => {
    if (!fechaInicio?.value || !fechaFin) return;
    const inicio = new Date(fechaInicio.value + "T00:00:00");
    if (Number.isNaN(inicio.getTime())) return;
    const sugerida = new Date(inicio);
    sugerida.setDate(sugerida.getDate() + 7);
    if (!fechaFin.value) {
      fechaFin.value = sugerida.toISOString().slice(0, 10);
    }
  };

  fechaInicio?.addEventListener("change", sugerirFechaFin);
  equipoSelect?.addEventListener("change", sugerirFechaFin);

  /* ---------- Devoluciones: cálculo automático de mora (RF-04) ---------- */
  const alquilerSelect = document.querySelector("[data-devolucion-alquiler]");
  const fechaPactadaEl = document.querySelector("[data-devolucion-fecha-pactada]");
  const fechaRealInput = document.querySelector("[data-devolucion-fecha-real]");
  const moraDiasEl = document.querySelector("[data-devolucion-mora-dias]");
  const moraMontoEl = document.querySelector("[data-devolucion-mora-monto]");
  const TARIFA_MORA_DIA = 25; // S/ por día de atraso — valor referencial del prototipo

  const calcularMora = () => {
    if (!alquilerSelect || !fechaPactadaEl || !fechaRealInput) return;
    const option = alquilerSelect.selectedOptions[0];
    const pactada = option?.dataset.fechaPactada;
    fechaPactadaEl.textContent = pactada ? formatFecha(pactada) : "—";

    if (!pactada || !fechaRealInput.value) {
      if (moraDiasEl) moraDiasEl.textContent = "—";
      if (moraMontoEl) moraMontoEl.textContent = "—";
      return;
    }

    const dPactada = new Date(pactada + "T00:00:00");
    const dReal = new Date(fechaRealInput.value + "T00:00:00");
    const diffMs = dReal - dPactada;
    const diffDias = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    if (moraDiasEl) moraDiasEl.textContent = `${diffDias} día(s)`;
    if (moraMontoEl) {
      const monto = diffDias * TARIFA_MORA_DIA;
      moraMontoEl.textContent = `S/ ${monto.toFixed(2)}`;
      moraMontoEl.classList.toggle("summary-card__value--danger", diffDias > 0);
    }
  };

  function formatFecha(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  alquilerSelect?.addEventListener("change", calcularMora);
  fechaRealInput?.addEventListener("change", calcularMora);

  /* ---------- Devoluciones: preview del estado al que pasa el equipo (RF-04) ---------- */
  const estadoEquipoSelect = document.querySelector("[data-devolucion-estado-equipo]");
  const estadoPreview = document.querySelector("[data-devolucion-estado-preview]");

  const ESTADO_INFO = {
    disponible: { label: "Disponible", pill: "status-pill--available" },
    mantenimiento: { label: "Mantenimiento", pill: "status-pill--maintenance" },
    baja: { label: "Baja de inventario", pill: "status-pill--danger" },
  };

  const actualizarPreviewEstado = () => {
    if (!estadoPreview) return;
    const equipoCodigo = alquilerSelect?.selectedOptions[0]?.dataset.equipo;
    const estadoInfo = ESTADO_INFO[estadoEquipoSelect?.value];

    if (!equipoCodigo || !estadoInfo) {
      estadoPreview.textContent = "Selecciona un alquiler y un estado para ver a qué estado pasará el equipo en Inventario.";
      return;
    }

    estadoPreview.innerHTML =
      `El equipo <code>${equipoCodigo}</code> pasará a estado: ` +
      `<span class="status-pill ${estadoInfo.pill}">${estadoInfo.label}</span> en Inventario.`;
  };

  estadoEquipoSelect?.addEventListener("change", actualizarPreviewEstado);
  alquilerSelect?.addEventListener("change", actualizarPreviewEstado);

  /* ---------- Ayuda: acordeón FAQ accesible ---------- */
  document.querySelectorAll(".faq__question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq__item");
      const isOpen = item.dataset.open === "true";
      item.dataset.open = String(!isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));
    });
  });
});
