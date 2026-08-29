// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente auxiliar para animar elementos al hacer scroll
const FadeInSection = ({ children, className = "", direction = "up" }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      });
    }, { threshold: 0.15 });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => currentRef && observer.unobserve(currentRef);
  }, []);

  const getDirectionClasses = () => {
    if (!isVisible) {
      if (direction === "left") return "opacity-0 -translate-x-12";
      if (direction === "right") return "opacity-0 translate-x-12";
      return "opacity-0 translate-y-12";
    }
    return "opacity-100 translate-x-0 translate-y-0";
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // Activamos la animación de entrada al cargar la página
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] text-slate-100 font-sans selection:bg-[#ff5733] selection:text-white overflow-x-hidden scroll-smooth">
      
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (FIJA ABSOLUTA) */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#141414]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-xs tracking-widest uppercase font-medium">
          <nav className="hidden md:flex gap-10 text-slate-300">
            <a href="#inicio" className="hover:text-white transition">Inicio</a>
            <a href="#sobre-mi" className="hover:text-white transition">Sobre Mí</a>
            <a href="#gimnasio" className="hover:text-white transition">Gimnasio</a>
            <a href="#contacto" className="hover:text-white transition">Contacto</a>
          </nav>

          <button 
            onClick={() => navigate('/login')} 
            className="border border-slate-600 text-white px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition duration-300 hover:bg-[#ff5733] hover:border-[#ff5733] cursor-pointer"
          >
            Login
          </button>
        </div>
      </header>

      {/* 2. SECCIÓN HERO (PRINCIPAL) */}
      <section id="inicio" className="relative h-screen w-full flex items-center justify-center text-center px-6 overflow-hidden">
        
        <div 
          className={`absolute inset-0 z-0 transition-all duration-[3000ms] ease-out ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <img 
            src="https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=1920&auto=format&fit=crop" 
            alt="Entrenador profesional" 
            className="w-full h-full object-cover object-[center_45%] filter grayscale contrast-125 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/60"></div>
        </div>

        <div className={`relative z-10 max-w-4xl mx-auto space-y-6 pt-20 transition-all duration-[2000ms] delay-500 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-[0.15em] uppercase text-white">
              ARETÉ
          </h1>
          <p className="text-sm sm:text-lg tracking-[0.3em] uppercase text-slate-300 font-light">
            Forma de superioridad o eficacia, desde la excelencia física de un atleta.
          </p>
          <div className="pt-4">
            <a 
              href="#contacto"
              className="inline-block border border-white/30 hover:border-[#ff5733] hover:bg-[#ff5733] text-white px-8 py-3 rounded-none uppercase tracking-widest text-xs font-bold transition duration-300 cursor-pointer shadow-2xl"
            >
              Reservar sesión
            </a>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: CONOCE AL ENTRENADOR */}
      <section id="sobre-mi" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <FadeInSection direction="left" className="space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-widest uppercase leading-tight">
              Conoce al <br />Entrenador
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Hola, soy Nicolas Rosales. Como profesor de educación física y entrenador profesional, entiendo que cada cuerpo y cada objetivo requieren de un enfoque técnico, seguro y medible.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mi misión es acompañarte en cada etapa de tu evolución, optimizando tus rutinas para garantizar un progreso real, constante y enfocado en tu máximo rendimiento.
            </p>
          </FadeInSection>

          <FadeInSection direction="right" className="relative overflow-hidden shadow-2xl border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop" 
              alt="Nicolas Rosales entrenando" 
              className="w-full h-[450px] object-cover filter grayscale contrast-110 hover:scale-105 transition duration-700"
            />
          </FadeInSection>

        </div>
      </section>

      {/* 4. SECCIÓN: GIMNASIO / GALERÍA (Todas fotos enfocadas en entrenamiento puro) */}
      <section id="gimnasio" className="py-20 bg-[#1c1c1c] border-t border-white/10">
        <FadeInSection direction="up">
          <div className="max-w-4xl mx-auto px-6 mb-12 text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-widest uppercase">
              Comienza Hoy a Entrenar
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Disciplina, esfuerzo y técnica para alcanzar tu máximo potencial físico.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection direction="up">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 px-2 max-w-7xl mx-auto">
            
            {/* 1. Persona entrenando con barra pesada */}
            <div className="h-72 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" alt="Entrenamiento de fuerza" className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition duration-500" />
            </div>

            {/* 2. Mancuernas organizadas en el gimnasio */}
            <div className="h-72 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop" alt="Equipamiento de gimnasio" className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition duration-500" />
            </div>

            {/* 3. Persona entrenando duro con mancuernas (Reemplazando la foto de risas) */}
            <div className="h-72 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop" alt="Persona entrenando en el gimnasio" className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition duration-500" />
            </div>

            {/* 4. Atleta entrenando con barra Z */}
            <div className="h-72 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop" alt="Entrenamiento avanzado" className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition duration-500" />
            </div>

            {/* 5. Personas haciendo ejercicios funcionales */}
            <div className="h-72 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop" alt="Ejercicio funcional" className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition duration-500" />
            </div>

            {/* 6. Detalle de peso libre y discos */}
            <div className="h-72 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop" alt="Pesas y discos" className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition duration-500" />
            </div>

          </div>
        </FadeInSection>
      </section>

      {/* 5. SECCIÓN DE CONTACTO */}
      <section id="contacto" className="bg-[#ff5733] text-[#141414] py-20 px-6">
        <FadeInSection direction="up">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black tracking-widest uppercase">
                Contacto
              </h2>
              <p className="text-sm font-medium leading-relaxed max-w-sm">
                Escribe o llámame si tienes alguna pregunta sobre las rutinas o los planes de entrenamiento.
              </p>
              <div className="space-y-2 text-sm font-bold pt-4">
                <p>rosalesnicolas60@gmail.com</p>
                <p>381 320-1884</p>
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <input 
                type="text" 
                placeholder="Nombre" 
                className="w-full bg-transparent border-b border-[#141414] pb-3 text-sm placeholder-[#141414]/70 focus:outline-none font-medium" 
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full bg-transparent border-b border-[#141414] pb-3 text-sm placeholder-[#141414]/70 focus:outline-none font-medium" 
              />
              <input 
                type="text" 
                placeholder="Asunto" 
                className="w-full bg-transparent border-b border-[#141414] pb-3 text-sm placeholder-[#141414]/70 focus:outline-none font-medium" 
              />
              <textarea 
                rows="3" 
                placeholder="Mensaje" 
                className="w-full bg-transparent border-b border-[#141414] pb-3 text-sm placeholder-[#141414]/70 focus:outline-none font-medium resize-none"
              ></textarea>
              
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  className="bg-[#141414] hover:bg-white text-white hover:text-[#141414] px-8 py-3 text-xs uppercase tracking-widest font-bold transition duration-300 cursor-pointer shadow-lg"
                >
                  Enviar
                </button>
              </div>
            </form>

          </div>

          <div className="max-w-7xl mx-auto mt-20 pt-6 border-t border-[#141414]/20 flex flex-col sm:flex-row justify-between items-center text-xs font-bold">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:opacity-70 transition cursor-pointer mb-4 sm:mb-0"
            >
              ↑ Subir
            </button>
            <p>© 2026 Nicolas Rosales — Desarrollado por Universumcorp</p>
          </div>
        </FadeInSection>
      </section>

      {/* Botón Flotante de WhatsApp */}
      <a
        href="https://wa.me/5493813201884?text=Hola%20Nicolas,%20quiero%20consultar%20sobre%20tus%20entrenamientos" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
        title="Escríbeme por WhatsApp"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="30" 
          height="30" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

    </div>
  );
};

export default Home;