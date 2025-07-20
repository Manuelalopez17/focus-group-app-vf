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

// Aquí pon tus arrays reales de riesgos por etapa.
// De momento solo un ejemplo mínimo para Abastecimiento:
const riesgosEjemplo = {
  Abastecimiento: [
    "Ejemplo de riesgo 1 para Abastecimiento",
    "Ejemplo de riesgo 2 para Abastecimiento",
    "Ejemplo de riesgo 3 para Abastecimiento"
  ],
  // Diseño: [ "Riesgo X", "Riesgo Y", ... ],
  // ... y así para las 11 etapas
};

const Participante = () => {
  // 1) Leer query params "session" o "sesion"
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const sesionParam = params.get("session") || params.get("sesion") || "";

  // 2) Agrupar por 1.x vs 2.x
  const tipoSesion = sesionParam.split(".")[0]; // "1" o "2"
  const esSesion1 = tipoSesion === "1";
  const esSesion2 = tipoSesion === "2";

  // Estados de formulario
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [etapa, setEtapa] = useState("");
  const [formularioCompletado, setFormularioCompletado] = useState(false);

  // Paginación de riesgos
  const [paginaActual, setPaginaActual] = useState(1);
  const riesgosPorPagina = 5;

  // Respuestas almacenadas temporalmente
  const [respuestas, setRespuestas] = useState({});

  // Lista de riesgos de la etapa seleccionada
  const riesgos = riesgosEjemplo[etapa] || [];
  const totalPaginas = Math.ceil(riesgos.length / riesgosPorPagina);
  const riesgosPagina = riesgos.slice(
    (paginaActual - 1) * riesgosPorPagina,
    paginaActual * riesgosPorPagina
  );

  // Handler para inputs de sesión 1.x
  const handleRespuesta = (riesgo, campo, valor) => {
    setRespuestas(prev => {
      const nueva = { ...(prev[riesgo] || {}), [campo]: valor };

      // Forzar suma 100% si quieres:
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

      // Calcular scores cuando estén todos los valores
      if (
        impacto != null &&
        frecuencia != null &&
        importancia_impacto != null &&
        importancia_frecuencia != null
      ) {
        nueva.score_base = impacto * frecuencia;
        nueva.score_final = Math.round(
          (importancia_impacto * impacto + importancia_frecuencia * frecuencia) /
            100
        );
      }

      return { ...prev, [riesgo]: nueva };
    });
  };

  // Handler para checkboxes de sesión 2.x
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

  // Guardar todo en Supabase
  const guardarRespuestas = async () => {
    for (const [riesgo, datos] of Object.entries(respuestas)) {
      await supabase.from("respuestas").insert({
        sesion: sesionParam,
        etapa,
        riesgo,
        nombre,
        empresa,
        experiencia,
        ...datos
      });
    }
    alert("Respuestas enviadas exitosamente.");
    window.location.reload();
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
            <select
              value={etapa}
              onChange={e => setEtapa(e.target.value)}
            >
              <option value="">Seleccione la etapa</option>
              {etapasProyecto.map(e => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select><br />
            <button
              onClick={() => etapa && setFormularioCompletado(true)}
            >
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2>Riesgos para la etapa: {etapa}</h2>

            {/* Listado y paginación de riesgos */}
            {riesgosPagina.map((riesgo, idx) => (
              <details
                key={idx}
                style={{ margin: "15px 0", textAlign: "left" }}
              >
                <summary>
                  <strong>{riesgo}</strong>
                </summary>

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
                          handleRespuesta(
                            riesgo,
                            "impacto",
                            Number(e.target.value)
                          )
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
                          handleRespuesta(
                            riesgo,
                            "frecuencia",
                            Number(e.target.value)
                          )
                        }
                      />
                    </label><br />
                    <label>
                      % Imp. Impacto:
                      <input
                        type="number"
                        value={respuestas[riesgo]?.importancia_impacto || ""}
                        onChange={e =>
                          handleRespuesta(
                            riesgo,
                            "importancia_impacto",
                            Number(e.target.value)
                          )
                        }
                      />
                    </label><br />
                    <label>
                      % Imp. Frecuencia:
                      <input
                        type="number"
                        value={respuestas[riesgo]?.importancia_frecuencia || ""}
                        onChange={e =>
                          handleRespuesta(
                            riesgo,
                            "importancia_frecuencia",
                            Number(e.target.value)
                          )
                        }
                      />
                    </label><br />
                    <p>Score Base: {respuestas[riesgo]?.score_base ?? 0}</p>
                    <p>Score Final: {respuestas[riesgo]?.score_final ?? 0}</p>
                  </>
                )}

                {esSesion2 && (
                  <>
                    <p>
                      ¿En qué etapas se presenta el efecto de este riesgo?
                    </p>
                    {etapasProyecto.map((et, j) => (
                      <label key={j} style={{ marginRight: "10px" }}>
                        <input
                          type="checkbox"
                          checked={
                            respuestas[riesgo]?.etapas_afectadas?.includes(et) ||
                            false
                          }
                          onChange={() =>
                            handleCheckboxEtapas(riesgo, et)
                          }
                        />
                        {et}
                      </label>
                    ))}
                  </>
                )}
              </details>
            ))}

            {/* Controles de paginación */}
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
