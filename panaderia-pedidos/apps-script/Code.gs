/**
 * BACKEND EN GOOGLE APPS SCRIPT
 * ------------------------------------------------------------
 * Este código NO va en GitHub ni en la carpeta del sitio: se pega
 * dentro del editor de Apps Script que se abre desde tu Google Sheet
 * (Extensiones > Apps Script). Ver README.md para el paso a paso.
 *
 * Qué hace:
 *  - doPost: recibe un pedido nuevo desde el formulario público y lo
 *    agrega como fila en la hoja "Pedidos". También recibe cambios de
 *    estado ("Enviado") desde el panel de administración.
 *  - doGet: le devuelve al panel de administración todos los pedidos
 *    guardados, en formato JSON.
 */

const SHEET_NAME = "Pedidos";
const COLUMNAS = [
  "Fecha", "Nombre Cliente", "Contacto", "Dirección", "Ubicación GPS",
  "Link Google Maps", "Pan con Queso", "Pan sin Queso", "Total Panes",
  "Medio de Pago", "Total a Pagar", "Estado",
];

/**
 * Ejecutá esta función UNA sola vez desde el editor de Apps Script
 * (▶ Ejecutar, con "inicializarHoja" seleccionada) para crear la
 * pestaña "Pedidos" con los encabezados correctos.
 */
function inicializarHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.clear();
  sheet.appendRow(COLUMNAS);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, COLUMNAS.length);
}

function doGet(e) {
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const pedidos = data.slice(1).map((fila, i) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = fila[idx]; });
    obj._row = i + 2; // número de fila real en el Sheet, para poder actualizarla
    return obj;
  });
  return respuestaJSON_({ ok: true, pedidos: pedidos });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    if (body.action === "actualizarEstado") {
      sheet.getRange(body.row, COLUMNAS.indexOf("Estado") + 1).setValue(body.estado || "Enviado");
      return respuestaJSON_({ ok: true });
    }

    // Pedido nuevo
    const totalPanes = (Number(body.panConQueso) || 0) + (Number(body.panSinQueso) || 0);
    sheet.appendRow([
      new Date(),
      body.nombre || "",
      body.contacto || "",
      body.direccion || "",
      body.ubicacionGPS || "",
      body.linkMaps || "",
      Number(body.panConQueso) || 0,
      Number(body.panSinQueso) || 0,
      totalPanes,
      body.medioPago || "",
      Number(body.totalPagar) || 0,
      "Pendiente",
    ]);
    return respuestaJSON_({ ok: true });
  } catch (err) {
    return respuestaJSON_({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No existe la pestaña "Pedidos". Ejecutá primero inicializarHoja().');
  return sheet;
}

function respuestaJSON_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
