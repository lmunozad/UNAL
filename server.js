const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module-free");

const app = express();
app.set("trust proxy", true); // necesario en Render para obtener la IP real del visitante
app.use(cors());
app.use(express.json({ limit: "5mb" })); // la firma dibujada viaja como imagen base64
app.use(express.static(path.join(__dirname, "public")));

const imageOpts = {
  centered: true,
  getImage: (tagValue) => Buffer.from(tagValue, "base64"),
  getSize: () => [160, 60],
};

// Formatos que llevan firma de la persona (tienen el marcador {%signature_image})
const FORMATOS_CON_FIRMA = new Set(["078", "079", "080"]);

const { CATALOGO, PROCESOS } = require("./procesos");

app.get("/api/procesos", (req, res) => {
  res.json(PROCESOS);
});

// Verifica el token de Cloudflare Turnstile contra la API oficial.
// Si no hay una llave secreta configurada (aún no se ha dado de alta la
// cuenta de Cloudflare), se omite la verificación para no romper las
// pruebas locales, pero se deja advertido en el registro del servidor.
async function verificarTurnstile(token, ip) {
  const secreto = process.env.TURNSTILE_SECRET_KEY;
  if (!secreto) {
    console.warn("TURNSTILE_SECRET_KEY no configurada: verificación de captcha omitida.");
    return true;
  }
  if (!token) return false;
  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secreto, response: token, remoteip: ip }),
    });
    const data = await resp.json();
    return data.success === true;
  } catch (err) {
    console.error("Error verificando Turnstile:", err.message);
    return false;
  }
}

app.post("/api/generar/:codigo", async (req, res) => {
  const { codigo } = req.params;
  const formato = CATALOGO[codigo];

  if (!formato) {
    return res.status(404).json({ error: `No existe una plantilla registrada para el formato ${codigo}` });
  }

  try {
    const ipSolicitante = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
    const captchaOk = await verificarTurnstile(req.body?.turnstile_token, ipSolicitante);
    if (!captchaOk) {
      return res.status(403).json({ error: "No se pudo verificar que la solicitud proviene de una persona real. Recarga la página e inténtalo de nuevo." });
    }

    const rutaPlantilla = path.join(__dirname, "plantillas", formato.archivo);
    const content = fs.readFileSync(rutaPlantilla, "binary");
    const zip = new PizZip(content);

    const datos = { ...(req.body || {}) };

    if (FORMATOS_CON_FIRMA.has(codigo)) {
      // La fecha, hora e IP se calculan en el servidor (no se confía en lo que
      // envíe el navegador) para que la constancia electrónica sea confiable.
      const ahora = new Date();
      const fechaHora = ahora.toLocaleString("es-CO", { timeZone: "America/Bogota" });
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "desconocida")
        .toString()
        .split(",")[0]
        .trim();

      datos.constancia_firma =
        `Firma electrónica registrada por ${datos.nombre_completo || "—"}, identificado(a) con ` +
        `${datos.tipo_identificacion || "C.C."} ${datos.numero_identificacion || "—"}. ` +
        `Firmado el ${fechaHora} (hora Colombia). IP de origen: ${ip}. Este documento fue firmado ` +
        `electrónicamente de conformidad con la Ley 527 de 1999.`;

      if (!datos.signature_image) {
        return res.status(400).json({ error: "Este formato requiere una firma dibujada antes de generarse." });
      }
    }

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: FORMATOS_CON_FIRMA.has(codigo) ? [new ImageModule(imageOpts)] : [],
    });

    doc.render(datos);

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=U_FT_08_007_${codigo}_generado.docx`
    );
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "No se pudo generar el documento. Revisa que todos los campos requeridos hayan sido enviados.",
      detalle: err.message,
    });
  }
});

app.get("/api/salud", (req, res) =>
  res.json({ ok: true, formatosDisponibles: Object.keys(CATALOGO), procesosDisponibles: Object.keys(PROCESOS) })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de generación de formatos escuchando en el puerto ${PORT}`);
});
