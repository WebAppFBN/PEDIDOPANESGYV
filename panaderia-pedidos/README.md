# Pedidos de Pan Casero

Sitio web con dos partes:

- **`index.html`** — formulario público donde los clientes hacen su pedido (nombre, contacto, dirección con ubicación de Google Maps, cantidad de pan con/sin queso y medio de pago).
- **`admin.html`** — panel privado donde vos ves todos los pedidos, los mandás por WhatsApp al cadete y descargás todo en Excel.

Los pedidos se guardan en un **Google Sheet**, así que se ven desde cualquier dispositivo (tu celular, tu compu, etc.) sin que dependan de un solo navegador.

No hace falta programar nada: solo seguir estos pasos y editar un archivo de configuración.

---

## 1. Crear la base de datos en Google Sheets

1. Entrá a [sheets.google.com](https://sheets.google.com) y creá una planilla nueva. Ponele el nombre que quieras (ej. "Pedidos Pan Casero").
2. Menú **Extensiones → Apps Script**. Se abre un editor de código en una pestaña nueva.
3. Borrá el contenido que aparece por defecto y pegá todo el contenido del archivo [`apps-script/Code.gs`](apps-script/Code.gs) de este repositorio.
4. Arriba, en el desplegable de funciones, elegí **`inicializarHoja`** y tocá el botón ▶ **Ejecutar**.
   - La primera vez te va a pedir autorización: elegí tu cuenta de Google y aceptá los permisos (va a avisar que es un script "no verificado" — es normal, es tu propio script; tocá "Avanzado" → "Ir a [tu proyecto] (no seguro)" → "Permitir").
   - Esto crea automáticamente una pestaña llamada **"Pedidos"** con las columnas correctas.

## 2. Publicar el script como Web App

1. En el editor de Apps Script, arriba a la derecha: **Implementar → Nueva implementación**.
2. En "Seleccionar tipo", el ícono de engranaje → **Aplicación web**.
3. Configurá:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
4. Tocá **Implementar** y copiá la **URL de la aplicación web** que te muestra (termina en `/exec`).

Esa URL es la que conecta tu sitio con el Google Sheet.

> Si más adelante modificás el código de `Code.gs`, tenés que hacer **Implementar → Administrar implementaciones → ✏️ → Nueva versión** para que los cambios se apliquen.

## 3. Configurar el sitio

Abrí `js/config.js` y completá:

```js
API_URL: "https://script.google.com/macros/s/AKfycb..../exec",  // la URL del paso 2
PRECIO_POR_PAN: 1000,                // precio por pan (con o sin queso)
WHATSAPP_CADETE: "5493884552367",    // WhatsApp del cadete, sin + ni espacios
DATOS_TRANSFERENCIA: "Alias: mi.alias.mp — te confirmamos por WhatsApp",
NOMBRE_NEGOCIO: "Pan Casero",
ADMIN_PIN: "1234",                   // clave para entrar a admin.html
```

## 4. Publicar el sitio en GitHub Pages

1. Subí esta carpeta completa a un repositorio de GitHub (puede ser público o privado — ver la nota de seguridad más abajo).
2. En el repositorio: **Settings → Pages**.
3. En "Source" elegí la rama `main` y la carpeta `/ (root)`. Guardá.
4. GitHub te va a dar una URL parecida a `https://tu-usuario.github.io/tu-repositorio/`.
   - El formulario de pedidos queda en esa URL (`index.html`).
   - El panel para vos queda en esa misma URL + `/admin.html`.

Listo: compartí el link del formulario con tus clientes (por WhatsApp, Instagram, etc.) y guardate el link de `admin.html` para vos.

---

## Cómo funciona cada parte

- **Ubicación automática:** al tocar "Usar mi ubicación actual", el celular del cliente comparte su posición GPS (con su permiso) y el sitio genera un link para verla en Google Maps. Esto es gratis y no necesita ninguna cuenta ni API key de Google — la contra es que es un *link* a Maps, no un mapa interactivo incrustado en la página (eso sí requeriría una cuenta de Google Cloud con facturación habilitada).
- **Envío por WhatsApp:** en el panel de administración, cada pedido tiene un botón "WhatsApp" que abre WhatsApp con el mensaje del pedido ya escrito, listo para el cadete. WhatsApp no permite enviar mensajes 100% automáticos sin usar la API oficial de WhatsApp Business (de pago y con proceso de aprobación) — por eso el botón te deja el mensaje armado y solo falta que toques "Enviar".
- **Descargar Excel:** el botón "Descargar Excel" del panel exporta todos los pedidos cargados en ese momento a un archivo `.xlsx`, para tener un respaldo o llevar contabilidad.

## Nota de seguridad sobre el PIN del panel

El `ADMIN_PIN` de `config.js` es una traba simple para que no cualquiera que encuentre el link de `admin.html` vea los pedidos — **no es seguridad real**, porque cualquiera que mire el código de la página puede ver la clave. Si te preocupa que los pedidos (nombres, teléfonos, direcciones) sean públicos:

- Usá un repositorio **privado** de GitHub (GitHub Pages funciona igual, pero para eso necesitás GitHub Pro o una organización — revisá el plan de tu cuenta).
- O, más simple: no compartas el link de `admin.html` con nadie más que vos.

## Editar textos o colores

- Precios, teléfono del cadete, nombre del negocio y clave del panel: todo en `js/config.js`.
- Colores y tipografía: en `css/style.css`, arriba del todo, en la sección `:root`.
