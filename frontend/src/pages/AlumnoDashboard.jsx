// src/pages/AlumnoDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { API_URL, authHeaders } from '../config/api';

const AlumnoDashboard = () => {
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [toastMensaje, setToastMensaje] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);

  useEffect(() => {
    const cargarDatosAlumnoServidor = async () => {
      try {
        const res = await fetch(`${API_URL}/api/alumnos/me`, { headers: authHeaders() });
        if (!res.ok) return;
        const alumnoEncontrado = await res.json();

        if (alumnoEncontrado) {
          if (!alumnoEncontrado.rutinaActual) {
            alumnoEncontrado.rutinaActual = { nombre: "Rutina General", dias: [] };
          }

          alumnoEncontrado.rutinaActual?.dias?.forEach(dia => {
            dia.ejercicios?.forEach(ej => {
              if (!ej.historial) {
                ej.historial = [];
              }
            });
          });
          setAlumno(alumnoEncontrado);
        }
      } catch (e) {
        console.error("Error al conectar con el servidor para cargar el panel del alumno:", e);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosAlumnoServidor();
  }, []);

  const registrarCarga = async (indexDia, indexEjercicio) => {
    if (alumno.estado === 'inactivo') {
      setToastMensaje('Tu cuenta se encuentra inactiva. No puedes registrar cargas.');
      setTimeout(() => setToastMensaje(null), 3500);
      return;
    }

    const nuevaCarga = prompt("Ingresa la carga (peso) utilizada hoy:");
    if (!nuevaCarga || nuevaCarga.trim() === "") return;

    const fechaHoy = new Date().toLocaleDateString();
    const alumnoActualizado = JSON.parse(JSON.stringify(alumno));
    const ejercicio = alumnoActualizado.rutinaActual.dias[indexDia].ejercicios[indexEjercicio];
    
    if (!ejercicio.historial) {
      ejercicio.historial = [];
    }
    
    ejercicio.historial.push({ fecha: fechaHoy, carga: nuevaCarga });
    setAlumno(alumnoActualizado);
    
    const alumnoId = alumnoActualizado._id || alumnoActualizado.id;
    try {
      await fetch(`${API_URL}/api/alumnos/${alumnoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(alumnoActualizado)
      });
    } catch (error) {
      console.error("Error al actualizar la carga en MongoDB:", error);
    }

    setToastMensaje(`¡Carga registrada con éxito para ${ejercicio.nombre}!`);
    setTimeout(() => setToastMensaje(null), 3500);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center font-sans text-slate-400 p-6 space-y-4 selection:bg-[#ff5733] selection:text-white">
        <p className="text-center text-xs uppercase tracking-widest">Cargando tu panel de entrenamiento...</p>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center font-sans text-slate-400 p-6 space-y-4 selection:bg-[#ff5733] selection:text-white">
        <p className="text-center text-xs uppercase tracking-widest">No se encontró una sesión de alumno válida o el usuario no está asociado a una rutina.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="bg-[#ff5733] hover:bg-[#e04828] text-white px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-black transition cursor-pointer shadow-lg"
        >
          Volver al Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col font-sans text-slate-100 selection:bg-[#ff5733] selection:text-white">
      
      <header className="bg-[#141414]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-20">
        <div>
          <h2 className="text-[10px] font-black tracking-widest text-[#ff5733] uppercase">MI PANEL DE ENTRENAMIENTO</h2>
          <p className="text-xs font-bold text-white mt-0.5 uppercase tracking-wider">Bienvenido, {alumno.nombre}</p>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); }} 
          className="text-xs font-black uppercase tracking-widest text-[#ff5733] hover:underline cursor-pointer"
        >
          ← Cerrar Sesión
        </button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
        
        {/* PERFIL INFO */}
        <div className="bg-[#1c1c1c] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div className="space-y-2">
            {alumno.estado === 'inactivo' ? (
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">Cuenta Inactiva</span>
            ) : (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">Cuenta Activa</span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">{alumno.nombre}</h1>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Objetivo principal: <span className="text-slate-200 font-bold">{alumno.objetivo || 'No especificado'}</span></p>
          </div>
          <div className="flex gap-3 text-xs w-full md:w-auto">
            <div className="bg-[#141414] border border-white/10 px-5 py-3 rounded-xl text-center flex-1 md:flex-initial">
              <span className="block text-slate-500 text-[10px] uppercase font-black tracking-widest">Peso</span>
              <span className="font-bold text-white text-sm">{alumno.peso ? `${alumno.peso} kg` : '-'}</span>
            </div>
            <div className="bg-[#141414] border border-white/10 px-5 py-3 rounded-xl text-center flex-1 md:flex-initial">
              <span className="block text-slate-500 text-[10px] uppercase font-black tracking-widest">Altura</span>
              <span className="font-bold text-white text-sm">{alumno.altura ? `${alumno.altura} cm` : '-'}</span>
            </div>
          </div>
        </div>

        {/* RUTINA ACTUAL */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">Rutina Actual: <span className="text-[#ff5733]">{alumno.rutinaActual?.nombre || "Rutina General"}</span></h2>
          <div className="space-y-4">
            {alumno.rutinaActual?.dias && alumno.rutinaActual.dias.length > 0 ? (
              alumno.rutinaActual.dias.map((diaItem, indexDia) => (
                <div key={indexDia} className="bg-[#1c1c1c] border border-white/10 rounded-xl p-6 space-y-4 shadow-xl">
                  <h3 className="font-black text-[#ff5733] text-sm tracking-widest uppercase border-b border-white/10 pb-2">{diaItem.dia}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {diaItem.ejercicios?.map((ej, indexEjercicio) => (
                      <div key={indexEjercicio} className="bg-[#141414] border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="font-bold text-white text-sm uppercase tracking-wide block">{ej.nombre}</span>
                          <div className="flex gap-3 text-xs text-slate-400 mt-1 uppercase tracking-wider">
                            <span>Series: <strong className="text-white">{ej.series}</strong></span>
                            <span>•</span>
                            <span>Carga base: <strong className="text-white">{ej.carga}</strong></span>
                          </div>
                        </div>
                        <button 
                          onClick={() => registrarCarga(indexDia, indexEjercicio)}
                          className={`text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl font-black shadow-md transition cursor-pointer ${
                            alumno.estado === 'inactivo' 
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                              : 'bg-[#ff5733] hover:bg-[#e04828] text-white'
                          }`}
                        >
                          + Registrar Carga
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-6 text-center text-slate-400 text-xs uppercase tracking-widest">
                No tienes ejercicios asignados en tu rutina actual.
              </div>
            )}
          </div>
        </div>

        {/* GRÁFICO DE EVOLUCIÓN */}
        <div className="bg-[#1c1c1c] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
          {(() => {
            const todosLosEjercicios = alumno.rutinaActual?.dias?.flatMap(d => d.ejercicios || []) || [];

            // Sacamos año-mes de una fecha con formato dd/mm/yyyy
            const obtenerAnioMes = (fechaStr) => {
              const partes = (fechaStr || '').split('/');
              if (partes.length !== 3) return null;
              return `${partes[2]}-${partes[1].padStart(2, '0')}`;
            };

            const nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

            const etiquetaMes = (anioMes) => {
              const [anio, mes] = anioMes.split('-');
              return `${nombresMeses[parseInt(mes, 10) - 1]} ${anio}`;
            };

            // Juntamos todos los meses que tengan al menos un registro, sin repetir
            const mesesDisponibles = [...new Set(
              todosLosEjercicios.flatMap(ej => (ej.historial || []).map(h => obtenerAnioMes(h.fecha)))
                .filter(Boolean)
            )].sort().reverse();

            const mesActivo = mesSeleccionado || mesesDisponibles[0] || null;

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Gráfico de Evolución de Cargas</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Visualización de tendencia basada en registros históricos.</p>
                  </div>

                  {mesesDisponibles.length > 0 && (
                    <select
                      value={mesActivo || ''}
                      onChange={(e) => setMesSeleccionado(e.target.value)}
                      className="bg-[#141414] border border-white/20 rounded-xl px-4 py-2 text-xs text-white uppercase tracking-wider outline-none focus:border-[#ff5733]"
                    >
                      {mesesDisponibles.map(anioMes => (
                        <option key={anioMes} value={anioMes}>{etiquetaMes(anioMes)}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-4">
                  {todosLosEjercicios.length === 0 && (
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-6 text-center text-slate-400 text-xs uppercase tracking-widest">
                      No hay ejercicios en la rutina actual.
                    </div>
                  )}

                  {(() => {
                    const ejerciciosConDatos = [];
                    const ejerciciosSinDatos = [];

                    todosLosEjercicios.forEach((ej, idx) => {
                      const historialDelMes = mesActivo
                        ? (ej.historial || []).filter(h => obtenerAnioMes(h.fecha) === mesActivo)
                        : [];
                      if (historialDelMes.length > 0) {
                        ejerciciosConDatos.push({ ej, idx, historialDelMes });
                      } else {
                        ejerciciosSinDatos.push({ ej, idx });
                      }
                    });

                    return (
                      <>
                        {ejerciciosConDatos.map(({ ej, idx, historialDelMes }) => (
                          <div key={idx} className="bg-[#141414] border border-white/10 p-5 rounded-xl space-y-4">
                            <div className="flex justify-between items-center text-xs font-black text-white uppercase tracking-wider">
                              <span>{ej.nombre}</span>
                              <span className="text-[#ff5733] text-[10px] tracking-widest">
                                {historialDelMes.length} registros
                              </span>
                            </div>

                            <div className="space-y-3 pt-1">
                              {historialDelMes.map((hist, hIdx) => {
                                const numCarga = parseFloat(hist.carga) || 10;
                                const porcentajeBarra = Math.min(Math.max((numCarga / 100) * 100, 15), 100);

                                return (
                                  <div key={hIdx} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                      <span>Fecha: {hist.fecha}</span>
                                      <span className="text-white">{hist.carga}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-[#ff5733] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${porcentajeBarra}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {ejerciciosSinDatos.length > 0 && (
                          <details className="bg-[#141414] border border-white/10 rounded-xl px-5 py-3">
                            <summary className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                              {ejerciciosSinDatos.length} ejercicio{ejerciciosSinDatos.length > 1 ? 's' : ''} sin registros este mes
                            </summary>
                            <div className="pt-3 space-y-2">
                              {ejerciciosSinDatos.map(({ ej, idx }) => (
                                <div key={idx} className="text-[11px] text-slate-500 uppercase tracking-wide">
                                  {ej.nombre}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </>
                    );
                  })()}
                </div>
              </>
            );
          })()}
        </div>

        {/* CHAT ENTRENADOR */}
        <div className="bg-[#1c1c1c] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="text-xl">💬</span>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Chat con el Entrenador</h3>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {(!alumno.observaciones || alumno.observaciones.length === 0) ? (
              <p className="text-xs text-slate-500 italic uppercase tracking-widest">No hay mensajes aún.</p>
            ) : (
              (Array.isArray(alumno.observaciones) ? alumno.observaciones : [{ remitente: 'admin', texto: alumno.observaciones }]).map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl text-xs max-w-[85%] ${
                    msg.remitente === 'alumno' 
                      ? 'bg-[#ff5733] text-white ml-auto rounded-br-none shadow-md font-medium' 
                      : 'bg-[#141414] text-slate-200 mr-auto rounded-bl-none border border-white/10 font-medium'
                  }`}
                >
                  <span className="block font-black text-[9px] uppercase tracking-widest opacity-75 mb-1">
                    {msg.remitente === 'alumno' ? 'Tú (Alumno)' : 'Entrenador'}
                  </span>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
                </div>
              ))
            )}
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const inputTexto = e.target.elements.inputRespuestaAlumno;
              const textoMensaje = inputTexto.value.trim();
              if (!textoMensaje) return;

              const nuevoMensaje = {
                remitente: 'alumno',
                texto: textoMensaje,
                fecha: new Date().toLocaleDateString()
              };

              const historialActual = Array.isArray(alumno.observaciones) 
                ? alumno.observaciones 
                : (alumno.observaciones ? [{ remitente: 'admin', texto: alumno.observaciones }] : []);

              const historialActualizado = [...historialActual, nuevoMensaje];
              const alumnoActualizado = { ...alumno, observaciones: historialActualizado };
              
              setAlumno(alumnoActualizado);

              const alumnoId = alumnoActualizado._id || alumnoActualizado.id;
              try {
                await fetch(`${API_URL}/api/alumnos/${alumnoId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', ...authHeaders() },
                  body: JSON.stringify(alumnoActualizado)
                });
              } catch (error) {
                console.error("Error al enviar mensaje al servidor:", error);
              }

              inputTexto.value = '';
            }}
            className="flex gap-3 pt-4 border-t border-white/10"
          >
            <input 
              type="text" 
              name="inputRespuestaAlumno"
              placeholder="Escribe una respuesta al entrenador..." 
              className="flex-1 bg-[#141414] border border-white/20 rounded-xl px-4 py-3 text-xs text-white uppercase tracking-wider placeholder-slate-600 outline-none focus:border-[#ff5733] transition font-medium"
            />
            <button 
              type="submit" 
              className="bg-[#ff5733] hover:bg-[#e04828] text-white px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-black cursor-pointer transition shadow-lg"
            >
              Enviar
            </button>
          </form>
        </div>

      </main>

      <footer className="w-full py-6 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest border-t border-white/5 bg-[#141414]">
        Desarrollado por Universumcorp © 2026
      </footer>

      <Toast mensaje={toastMensaje} onClose={() => setToastMensaje(null)} />

    </div>
  );
};

export default AlumnoDashboard;