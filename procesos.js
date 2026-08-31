// Catálogo de plantillas: código de formato -> archivo .docx preparado
const CATALOGO = {
  "072": { archivo: "plantilla_072_templated.docx", nombre: "Inscripción a proceso de selección transitoria" },
  "078": { archivo: "plantilla_078_templated.docx", nombre: "Compromisos institucionales para vinculación" },
  "079": { archivo: "plantilla_079_templated.docx", nombre: "Declaración juramentada Ley 4 de 1992" },
  "080": { archivo: "plantilla_080_templated.docx", nombre: "Constancia de aceptación de nombramiento" },
  "081": { archivo: "plantilla_081_templated.docx", nombre: "Lista de chequeo de documentación" },
  "090": { archivo: "plantilla_090_templated.docx", nombre: "Afiliación a seguridad social" },
  "039": { archivo: "plantilla_039_templated.docx", nombre: "Reporte de novedades de encargos" },
};

// Los 3 procesos institucionales y la secuencia de formatos que cada uno dispara.
// Esta secuencia refleja el orden real descrito en los procedimientos U.PR.08.007.017,
// U.PR.08.007.034 y U.PR.08.007.035.
const PROCESOS = {
  "017": {
    nombre: "Selección de personal administrativo (provisión transitoria)",
    descripcion: "Inscripción de aspirantes a vacantes en encargo o provisionalidad.",
    formatos: ["072"],
  },
  "034": {
    nombre: "Vinculación de personal académico en período de prueba",
    descripcion: "Desde la verificación de documentos hasta el acta de posesión.",
    formatos: ["081", "080", "090", "078"],
  },
  "035": {
    nombre: "Vinculación de personal administrativo (CA, LNR, provisionales, supernumerarios, TO, EEBM)",
    descripcion: "Desde la declaración jurada hasta el acta de posesión. Incluye el reporte de novedades si la vinculación es en encargo.",
    formatos: ["079", "081", "080", "090", "078"],
  },
};

module.exports = { CATALOGO, PROCESOS };
