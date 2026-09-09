# Piloto de automatización de formatos — UNAL

Este proyecto es un servidor web que genera automáticamente los formatos
U.FT.08.007.080 (Aceptación de Nombramiento) y U.FT.08.007.090 (Afiliación
a Seguridad Social) a partir de un formulario web paso a paso.

## Qué contiene

- `server.js` — servidor Express con la API de generación de documentos
- `public/index.html` — el formulario web (el "asistente paso a paso")
- `plantillas/` — las plantillas .docx reales de la UNAL, ya preparadas con
  marcadores `{campo}` en lugar de los espacios en blanco originales
- `package.json` — dependencias del proyecto

## Cómo probarlo en tu computador (opcional, antes de desplegar)

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 18 o más reciente).

```bash
npm install
npm start
```

Luego abre `http://localhost:3000` en tu navegador.

## Cómo desplegarlo gratis en Render

1. **Sube este proyecto a GitHub**
   - Crea un repositorio nuevo (puede ser privado) en https://github.com/new
   - Sube todos estos archivos al repositorio (arrastrando los archivos
     en la interfaz web de GitHub es suficiente, no necesitas usar la
     terminal si no te sientes cómodo con Git todavía)

2. **Crea una cuenta en Render**
   - Ve a https://render.com y regístrate gratis (puedes usar tu cuenta de GitHub)

3. **Crea un nuevo "Web Service"**
   - En el panel de Render, elige "New +" → "Web Service"
   - Conecta tu cuenta de GitHub y selecciona el repositorio que acabas de crear
   - Render detectará automáticamente que es un proyecto Node.js
   - Configuración:
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free
   - Haz clic en "Create Web Service"

4. **Espera el despliegue** (1-3 minutos)
   - Render te dará una URL pública, algo como `https://tu-proyecto.onrender.com`
   - Esa URL ya es accesible desde cualquier computador, sin instalar nada

5. **Pruébalo**
   - Abre la URL que te dio Render
   - Diligencia el formulario de prueba y confirma que los dos documentos
     se descargan correctamente

## Nota importante sobre el plan gratuito de Render

El plan gratuito "duerme" el servidor después de un tiempo sin uso. Esto
significa que la primera visita después de un rato de inactividad puede
tardar 20-50 segundos en responder mientras el servidor "despierta". Las
visitas siguientes son instantáneas. Para una demo o un punto de control,
esto es aceptable; para producción real con muchos usuarios, conviene
evaluar un plan pago económico o alojamiento institucional.

## Cómo activar la verificación anti-bots (Cloudflare Turnstile)

El formulario de Vinculación ya incluye el widget de Turnstile, pero está usando una
llave de prueba genérica. Para activarlo con tu propia cuenta (gratuita):

1. Crea una cuenta en https://dash.cloudflare.com (gratis, no requiere tener un
   dominio propio administrado por Cloudflare).
2. En el panel, ve a "Turnstile" y crea un nuevo "Site". Te dará dos llaves:
   una pública (Site Key) y una secreta (Secret Key).
3. Reemplaza `0x0000000000000000000000AA` en `public/vinculacion.html` (atributo
   `data-sitekey`) por tu Site Key real.
4. En Render, ve a tu servicio → "Environment" → agrega una variable:
   `TURNSTILE_SECRET_KEY` = tu Secret Key.
5. Vuelve a desplegar (Render lo hace automático al detectar el cambio en GitHub,
   o puedes forzarlo con "Manual Deploy").

Mientras no configures `TURNSTILE_SECRET_KEY`, el servidor sigue funcionando con
normalidad (para no bloquear las pruebas), pero sin bloquear bots de verdad —
se advierte en el registro del servidor.



- Agregar más formatos al `CATALOGO` en `server.js` (siguiendo el mismo
  patrón: preparar la plantilla, guardarla en `/plantillas`, registrarla)
- Conectar una base de datos (por ejemplo, Supabase gratuito) para que
  el "expediente" de cada persona se guarde y no haya que volver a
  digitarlo entre formato y formato
- Sumar control de acceso (usuario y contraseña) antes de usar datos
  reales de funcionarios
