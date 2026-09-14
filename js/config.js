// ============================================================
// CONFIGURACIÓN — Editá estos valores con los tuyos.
// No hace falta tocar ningún otro archivo del proyecto.
// ============================================================
const CONFIG = {
  // Pegá aquí la URL de tu Google Apps Script Web App
  // (la conseguís siguiendo el paso 2 del README).
  API_URL: "https://script.google.com/macros/s/AKfycbxfTN2QLPbyCrWXzvpPt1WKmHA_lon9MqQz8u-rwZ1ZzbaFChz6I3xsDYhBVyGWTzj7/exec",

  // Precio por pan — se usa tanto para "con queso" como "sin queso".
  PRECIO_POR_PAN: 1000,

  // WhatsApp del cadete/delivery, en formato internacional, solo números
  // (código de país + código de área sin 0 + número, sin +, sin espacios).
  // Ejemplo Argentina: 5493884552367
  WHATSAPP_CADETE: "5493884755683",

  // Qué mostrarle al cliente cuando elige "Transferencia".
  DATOS_TRANSFERENCIA: "Alias:NOEBTE — te confirmamos por WhatsApp",

  // Nombre que aparece en el encabezado del formulario.
  NOMBRE_NEGOCIO: "Pan Casero",

  // Clave para entrar al panel de administración.
  // Ojo: esto es solo una traba simple, no es seguridad real (ver README).
  ADMIN_PIN: "1234",
};
