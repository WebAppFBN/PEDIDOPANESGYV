(function () {
  const pinOverlay = document.getElementById("pinOverlay");
  const formPin = document.getElementById("formPin");
  const pinInput = document.getElementById("pinInput");
  const pinError = document.getElementById("pinError");
  const panelAdmin = document.getElementById("panelAdmin");
  const nombreNegocio = document.getElementById("nombreNegocio");
  const cuerpoTabla = document.getElementById("cuerpoTabla");
  const btnActualizar = document.getElementById("btnActualizar");
  const btnDescargar = document.getElementById("btnDescargar");
  const resumenPedidos = document.getElementById("resumenPedidos");
  const resumenPanes = document.getElementById("resumenPanes");
  const resumenTotal = document.getElementById("resumenTotal");

  nombreNegocio.textContent = CONFIG.NOMBRE_NEGOCIO || "Pan Casero";

  let pedidosActuales = [];

  // ---- Acceso con PIN (traba simple, no seguridad real — ver README) ----
  if (sessionStorage.getItem("adminOk") === "1") {
    mostrarPanel();
  }

  formPin.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (pinInput.value === CONFIG.ADMIN_PIN) {
      sessionStorage.setItem("adminOk", "1");
      mostrarPanel();
    } else {
      pinError.style.display = "block";
      pinInput.value = "";
      pinInput.focus();
    }
  });

  function mostrarPanel() {
    pinOverlay.style.display = "none";
    panelAdmin.style.display = "block";
    cargarPedidos();
  }

  // ---- Carga de pedidos desde Google Sheets ----
  async function cargarPedidos() {
    cuerpoTabla.innerHTML = '<tr><td colspan="11" class="vacio">Cargando pedidos…</td></tr>';
    if (!CONFIG.API_URL || CONFIG.API_URL.includes("PEGA_AQUI")) {
      cuerpoTabla.innerHTML = '<tr><td colspan="11" class="vacio">Falta configurar API_URL en js/config.js</td></tr>';
      return;
    }
    try {
      const resp = await fetch(CONFIG.API_URL);
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Error desconocido");
      pedidosActuales = data.pedidos || [];
      renderTabla();
      renderResumen();
    } catch (err) {
      cuerpoTabla.innerHTML = `<tr><td colspan="11" class="vacio">No se pudieron cargar los pedidos (${err.message}).</td></tr>`;
    }
  }

  function renderResumen() {
    const totalPedidos = pedidosActuales.length;
    const totalPanes = pedidosActuales.reduce((s, p) => s + (Number(p["Total Panes"]) || 0), 0);
    const totalCobrar = pedidosActuales.reduce((s, p) => s + (Number(p["Total a Pagar"]) || 0), 0);
    resumenPedidos.textContent = totalPedidos;
    resumenPanes.textContent = totalPanes;
    resumenTotal.textContent = `$${totalCobrar.toLocaleString("es-AR")}`;
  }

  function renderTabla() {
    if (pedidosActuales.length === 0) {
      cuerpoTabla.innerHTML = '<tr><td colspan="11" class="vacio">Todavía no hay pedidos.</td></tr>';
      return;
    }
    // Más nuevos primero
    const ordenados = [...pedidosActuales].reverse();
    cuerpoTabla.innerHTML = "";
    ordenados.forEach((p) => {
      const tr = document.createElement("tr");

      const fecha = p["Fecha"] ? new Date(p["Fecha"]).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "";
      const estado = p["Estado"] || "Pendiente";
      const linkMaps = p["Link Google Maps"];
      const direccionHtml = linkMaps
        ? `${escapeHtml(p["Dirección"])}<br><a href="${linkMaps}" target="_blank" rel="noopener">Ver en Maps</a>`
        : escapeHtml(p["Dirección"]);

      tr.innerHTML = `
        <td>${fecha}</td>
        <td>${escapeHtml(p["Nombre Cliente"])}</td>
        <td>${escapeHtml(p["Contacto"])}</td>
        <td>${direccionHtml}</td>
        <td>${p["Pan con Queso"] || 0}</td>
        <td>${p["Pan sin Queso"] || 0}</td>
        <td>${p["Total Panes"] || 0}</td>
        <td>${escapeHtml(p["Medio de Pago"])}</td>
        <td>$${(Number(p["Total a Pagar"]) || 0).toLocaleString("es-AR")}</td>
        <td><span class="pill ${estado === "Enviado" ? "pill--enviado" : "pill--pendiente"}">${estado}</span></td>
        <td class="accion-fila">
          <a href="#" class="whatsapp" data-row="${p._row}">WhatsApp</a>
          <button type="button" data-row="${p._row}" data-marcar="1" ${estado === "Enviado" ? "disabled" : ""}>Marcar enviado</button>
        </td>
      `;

      tr.querySelector(".whatsapp").addEventListener("click", (ev) => {
        ev.preventDefault();
        enviarWhatsApp(p);
      });
      tr.querySelector("[data-marcar]").addEventListener("click", () => marcarEnviado(p));

      cuerpoTabla.appendChild(tr);
    });
  }

  function enviarWhatsApp(p) {
    const lineas = [
      `🍞 Pedido para entregar`,
      `Cliente: ${p["Nombre Cliente"]}`,
      `Contacto: ${p["Contacto"]}`,
      `Dirección: ${p["Dirección"]}`,
      p["Link Google Maps"] ? `Ubicación: ${p["Link Google Maps"]}` : null,
      `Pan con queso: ${p["Pan con Queso"] || 0}`,
      `Pan sin queso: ${p["Pan sin Queso"] || 0}`,
      `Medio de pago: ${p["Medio de Pago"]}`,
      `Total a cobrar: $${(Number(p["Total a Pagar"]) || 0).toLocaleString("es-AR")}`,
    ].filter(Boolean);
    const mensaje = encodeURIComponent(lineas.join("\n"));
    const numero = (CONFIG.WHATSAPP_CADETE || "").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank", "noopener");
  }

  async function marcarEnviado(p) {
    try {
      const resp = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "actualizarEstado", row: p._row, estado: "Enviado" }),
      });
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Error desconocido");
      p["Estado"] = "Enviado";
      renderTabla();
    } catch (err) {
      alert("No se pudo actualizar el estado. Probá de nuevo.");
    }
  }

  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ---- Exportar a Excel (usa la lista cargada actualmente) ----
  btnDescargar.addEventListener("click", () => {
    if (pedidosActuales.length === 0) {
      alert("No hay pedidos para descargar todavía.");
      return;
    }
    const filas = pedidosActuales.map((p) => ({
      Fecha: p["Fecha"] ? new Date(p["Fecha"]).toLocaleString("es-AR") : "",
      "Nombre Cliente": p["Nombre Cliente"],
      Contacto: p["Contacto"],
      Dirección: p["Dirección"],
      "Link Google Maps": p["Link Google Maps"],
      "Pan con Queso": p["Pan con Queso"],
      "Pan sin Queso": p["Pan sin Queso"],
      "Total Panes": p["Total Panes"],
      "Medio de Pago": p["Medio de Pago"],
      "Total a Pagar": p["Total a Pagar"],
      Estado: p["Estado"],
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Pedidos");
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `pedidos_pan_${fechaArchivo}.xlsx`);
  });

  btnActualizar.addEventListener("click", cargarPedidos);
})();
