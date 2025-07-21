import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const etapasProyecto = [
  "Abastecimiento",
  "Prefactibilidad y Factibilidad",
  "Planeación",
  "Contratación y Adquisición",
  "Diseño",
  "Fabricación",
  "Logística y Transporte",
  "Montaje",
  "Construcción",
  "Puesta en Marcha",
  "Disposición Final"
];

// Temporal: reemplaza estos con tus riesgos reales por etapa
const riesgosEjemplo = {
  Abastecimiento: [
    "Ejemplo de riesgo 1 para Abastecimiento",
    "Ejemplo de riesgo 2 para Abastecimiento",
    "Ejemplo de riesgo 3 para Abastecimiento"
  ]
  // Añade las demás etapas aquí
};

const Participante = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const sesionParam = params.get("session") || params.get("sesion") || "";

  const tipoSesion = sesionParam.split(".")[0];
  const esSesion1 = tipoSesion === "1";
  const esSesion2 = tipoSesion === "2";

  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [etapa, setEtapa] = useState("");
  const [formularioCompletado, setFormularioCompletado] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [respuestas, setRespuestas] = useState({});

  const riesgos = riesgosEjemplo[etapa] || [];
  const riesgosPorPagina = 5;
  const totalPaginas = Math.ceil(riesgos.length / riesgosPorPagina);
  const riesgosPagina = riesgos.slice(
    (paginaActual - 1) * riesgosPorPagina,
    paginaActual * riesgosPorPagina
  );

  const handleRespuesta = (riesgo, campo, valor) => {
    setRespuestas(prev => {
      const nueva = { ...(prev[riesgo] || {}), [campo]: valor };

      if (campo === "importancia_impacto") {
        nueva.importancia_frecuencia = 100 - valor;
      }
      if (campo === "importancia_frecuencia") {
        nueva.importancia_impacto = 100 - valor;
      }

      const {
        impacto,
        frecuencia,
        importancia_impacto,
        importancia_frecuencia
      } = nueva;

      if (
        impacto != null &&
        frecuencia != null &&
        importancia_impacto != null &&
        importancia_frecuencia != null
      ) {
        nueva.score_base = impacto * frecuencia;
        nueva.score_final = Math.round(
          (importancia_impacto * impacto + importancia_frecuencia * frecuencia) / 100
        );
      }

      return { ...prev, [riesgo]: nueva };
    });
  };

  const handleCheckboxEtapas = (riesgo, et) => {
    setRespuestas(prev => {
      const actuales = prev[riesgo]?.etapas_afectadas || [];
      const nuevas = actuales.includes(et)
        ? actuales.filter(x => x !== et)
        : [...actuales, et];
      return {
        ...prev,
        [riesgo]: { ...(prev[riesgo] || {}), etapas_afectadas: nuevas }
      };
    });
  };

  const guardarRespuestas = async () => {
    try {
      for (const [riesgo, datos] of Object.entries(respuestas)) {
        const { error } = await supabase.from("focus-group-db").insert({
          sesion: sesionParam,
          etapa,
          riesgo,
          nombre,
          empresa,
          experiencia: parseInt(experiencia),
          ...datos
        });
        if (error) throw error;
      }
      alert("Respuestas enviadas exitosamente.");
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar en Supabase:", error);
      alert("Hubo un error al guardar las respuestas. Intenta nuevamente.");
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url('/proyecto.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "30px",
          borderRadius: "15px",
          width: "80%",
          maxWidth: "900px",
          textAlign: "center"
        }}
      >
        {!formularioCompletado ? (
          <>
            <h2>P6 – Proyecto Riesgos</h2>
            <input
              placeholder="Nombre completo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            /><br />
            <input
              placeholder="Empresa"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
            /><br />
            <input
              placeholder="Años de experiencia"
              type="number"
              value={experiencia}
              onChange={e => setExperiencia(e.target.value)}
            /><br />
            <select value={etapa} onChange={e => setEtapa(e.target.value)}>
              <option value="">Seleccione la etapa</option>
              {etapasProyecto.map(e => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select><br />
            <button onClick={() => etapa && setFormularioCompletado(true)}>
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2>Riesgos para la etapa: {etapa}</h2>

            {riesgosPagina.map((riesgo, idx) => (
              <details
                key={idx}
                style={{ margin: "15px 0", textAlign: "left" }}
              >
                <summary><strong>{riesgo}</strong></summary>

                {esSesion1 && (
                  <>
                    <label>
                      Impacto:
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={respuestas[riesgo]?.impacto || ""}
                        onChange={e =>
                          handleRespuesta(riesgo, "impacto", Number(e.target.value))
                        }
                      />
                    </label><br />
                    <label>
                      Frecuencia:
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={respuestas[riesgo]?.frecuencia || ""}
                        onChange={e =>
                          handleRespuesta(riesgo, "frecuencia", Number(e.target.value))
                        }
                      />
                    </label><br />
                    <label>
                      % Imp. Impacto:
                      <input
                        type="number"
                        value={respuestas[riesgo]?.importancia_impacto || ""}
                        onChange={e =>
                          handleRespuesta(riesgo, "importancia_impacto", Number(e.target.value))
                        }
                      />
                    </label><br />
                    <label>
                      % Imp. Frecuencia:
                      <input
                        type="number"
                        value={respuestas[riesgo]?.importancia_frecuencia || ""}
                        onChange={e =>
                          handleRespuesta(riesgo, "importancia_frecuencia", Number(e.target.value))
                        }
                      />
                    </label><br />
                    <p>Score Base: {respuestas[riesgo]?.score_base ?? 0}</p>
                    <p>Score Final: {respuestas[riesgo]?.score_final ?? 0}</p>
                  </>
                )}

                {esSesion2 && (
                  <>
                    <p>¿En qué etapas se presenta el efecto de este riesgo?</p>
                    {etapasProyecto.map((et, j) => (
                      <label key={j} style={{ marginRight: "10px" }}>
                        <input
                          type="checkbox"
                          checked={respuestas[riesgo]?.etapas_afectadas?.includes(et) || false}
                          onChange={() => handleCheckboxEtapas(riesgo, et)}
                        />
                        {et}
                      </label>
                    ))}
                  </>
                )}
              </details>
            ))}

            <div style={{ marginTop: "20px" }}>
              {paginaActual > 1 && (
                <button onClick={() => setPaginaActual(p => p - 1)}>
                  Anterior
                </button>
              )}
              {paginaActual < totalPaginas && (
                <button onClick={() => setPaginaActual(p => p + 1)}>
                  Siguiente
                </button>
              )}
              {paginaActual === totalPaginas && (
                <button onClick={guardarRespuestas}>
                  Enviar respuestas
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Participante;
