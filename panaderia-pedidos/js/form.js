(function () {
  const form = document.getElementById("formPedido");
  const nombreNegocio = document.getElementById("nombreNegocio");
  const btnUbicacion = document.getElementById("btnUbicacion");
  const estadoUbicacion = document.getElementById("estadoUbicacion");
  const conQueso = document.getElementById("conQueso");
  const sinQueso = document.getElementById("sinQueso");
  const totalPagarEl = document.getElementById("totalPagar");
  const radiosPago = form.querySelectorAll('input[name="medioPago"]');
  const notaTransferencia = document.getElementById("notaTransferencia");
  const btnEnviar = document.getElementById("btnEnviar");
  const mensajeError = document.getElementById("mensajeError");
  const mensajeConfirmacion = document.getElementById("mensajeConfirmacion");

  nombreNegocio.textContent = CONFIG.NOMBRE_NEGOCIO || "Pan Casero";

  let ubicacion = { lat: null, lng: null, link: "" };

  // ---- Ubicación (GPS del navegador, sin costo ni API key) ----
  btnUbicacion.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      estadoUbicacion.textContent = "Tu navegador no permite compartir ubicación. Escribí la dirección a mano.";
      return;
    }
    estadoUbicacion.textContent = "Buscando tu ubicación…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        ubicacion.lat = latitude;
        ubicacion.lng = longitude;
        ubicacion.link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        estadoUbicacion.innerHTML =
          `Ubicación detectada ✅ <a href="${ubicacion.link}" target="_blank" rel="noopener">Ver en Google Maps</a>`;
      },
      () => {
        estadoUbicacion.textContent = "No pudimos obtener tu ubicación. Revisá los permisos o escribí la dirección a mano.";
      }
    );
  });

  // ---- Total en vivo ----
  function actualizarTotal() {
    const cantidad = (Number(conQueso.value) || 0) + (Number(sinQueso.value) || 0);
    const total = cantidad * CONFIG.PRECIO_POR_PAN;
    totalPagarEl.textContent = `$${total.toLocaleString("es-AR")}`;
    return total;
  }
  conQueso.addEventListener("input", actualizarTotal);
  sinQueso.addEventListener("input", actualizarTotal);
  actualizarTotal();

  // ---- Nota de transferencia ----
  function actualizarNotaPago() {
    const seleccionado = form.querySelector('input[name="medioPago"]:checked').value;
    if (seleccionado === "Transferencia") {
      notaTransferencia.textContent = CONFIG.DATOS_TRANSFERENCIA;
      notaTransferencia.style.display = "block";
    } else {
      notaTransferencia.style.display = "none";
    }
  }
  radiosPago.forEach((r) => r.addEventListener("change", actualizarNotaPago));
  actualizarNotaPago();

  // ---- Envío del pedido ----
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    mensajeError.style.display = "none";

    const nombre = document.getElementById("nombre").value.trim();
    const contacto = document.getElementById("contacto").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const cQueso = Number(conQueso.value) || 0;
    const sQueso = Number(sinQueso.value) || 0;
    const medioPago = form.querySelector('input[name="medioPago"]:checked').value;
    const total = actualizarTotal();

    if (!nombre || !contacto || !direccion) {
      mensajeError.textContent = "Completá nombre, contacto y dirección antes de confirmar.";
      mensajeError.style.display = "block";
      return;
    }
    if (cQueso + sQueso <= 0) {
      mensajeError.textContent = "Elegí al menos un pan (con o sin queso).";
      mensajeError.style.display = "block";
      return;
    }
    if (!CONFIG.API_URL || CONFIG.API_URL.includes("PEGA_AQUI")) {
      mensajeError.textContent = "El formulario todavía no está conectado a Google Sheets (falta configurar API_URL en js/config.js).";
      mensajeError.style.display = "block";
      return;
    }

    const payload = {
      nombre, contacto, direccion,
      ubicacionGPS: ubicacion.lat ? `${ubicacion.lat}, ${ubicacion.lng}` : "",
      linkMaps: ubicacion.link || "",
      panConQueso: cQueso,
      panSinQueso: sQueso,
      medioPago,
      totalPagar: total,
    };

    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando…";

    try {
      const resp = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita el preflight CORS en Apps Script
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Error desconocido");

      form.style.display = "none";
      mensajeConfirmacion.style.display = "block";
    } catch (err) {
      mensajeError.textContent = "No pudimos enviar tu pedido. Probá de nuevo en un momento.";
      mensajeError.style.display = "block";
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Confirmar pedido";
    }
  });
})();
