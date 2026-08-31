const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Catálogo de formatos disponibles: código del formato -> archivo de plantilla.
// Para agregar un formato nuevo al piloto, solo hay que:
//   1) preparar su plantilla (insertar marcadores {campo} donde había placeholders)
//   2) guardarla en /plantillas
//   3) agregar una línea aquí
const CATALOGO = {
  "080": "plantilla_080_templated.docx",
  "090": "plantilla_090_templated.docx",
};

app.post("/api/generar/:codigo", (req, res) => {
  const { codigo } = req.params;
  const archivo = CATALOGO[codigo];

  if (!archivo) {
    return res.status(404).json({ error: `No existe una plantilla registrada para el formato ${codigo}` });
  }

  try {
    const rutaPlantilla = path.join(__dirname, "plantillas", archivo);
    const content = fs.readFileSync(rutaPlantilla, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.render(req.body || {});

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

app.get("/api/salud", (req, res) => res.json({ ok: true, formatosDisponibles: Object.keys(CATALOGO) }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de generación de formatos escuchando en el puerto ${PORT}`);
});
