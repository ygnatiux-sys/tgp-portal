import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface CoverflowPost {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  collectionLabel?: string;
  date?: string;
}

interface CoverflowCarouselProps {
  posts: CoverflowPost[];
  eyebrow?: string;
  title?: string;
  ctaText?: string;
}

export default function CoverflowCarousel({
  posts = [],
  eyebrow = 'Cinematografía Editorial',
  title = 'Publicaciones Recientes',
  ctaText = 'Leer Ahora',
}: CoverflowCarouselProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Centrar inicialmente si hay posts
  useEffect(() => {
    if (posts.length >= 3) {
      setActiveIndex(Math.floor(posts.length / 2));
    } else {
      setActiveIndex(0);
    }
  }, [posts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : posts.length - 1));
  }, [posts.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < posts.length - 1 ? prev + 1 : 0));
  }, [posts.length]);

  // Manejo de flechas de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch / Swipe para móviles
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      handleNext();
    } else if (distance < -40) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!posts || posts.length === 0) return null;

  return (
    <div className="w-full py-8 md:py-14 bg-transparent text-[#E8E2DA] select-none relative overflow-hidden">
      {/* Header Editorial */}
      {(title || eyebrow) && (
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-6 sm:mb-8 flex items-end justify-between relative z-30">
          <div>
            {eyebrow && (
              <span className="text-[9px] tracking-[0.45em] uppercase font-mono text-amber-500/90 block mb-2 font-bold">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-tight text-white uppercase">
                {title}
              </h2>
            )}
          </div>

          {/* Contador de posición discreto */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono tracking-widest text-white/40">
            <span className="text-amber-400 font-bold">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span>/</span>
            <span>{String(posts.length).padStart(2, '0')}</span>
          </div>
        </div>
      )}

      {/* ── ESCENARIO PRINCIPAL: Extendido a los costados con fundido ── */}
      <div 
        className="relative w-full h-135 sm:h-150 md:h-165 lg:h-175 flex justify-center items-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Viñeta Lateral Izquierda: Fundido al fondo (como en el sample) ── */}
        <div className="absolute inset-y-0 left-0 w-28 sm:w-48 md:w-72 lg:w-96 bg-linear-to-r from-[var(--void-bg,#121413)] via-[var(--void-bg,#121413)]/85 to-transparent pointer-events-none z-35" />

        {/* ── Viñeta Lateral Derecha: Fundido al fondo (como en el sample) ── */}
        <div className="absolute inset-y-0 right-0 w-28 sm:w-48 md:w-72 lg:w-96 bg-linear-to-l from-[var(--void-bg,#121413)] via-[var(--void-bg,#121413)]/85 to-transparent pointer-events-none z-35" />

        {/* Pista de Tarjetas Coverflow (5 tarjetas en abanico) */}
        <div className="relative w-full h-full flex justify-center items-center">
          {posts.map((post, idx) => {
            const diff = idx - activeIndex;
            const isActive = diff === 0;
            const absDiff = Math.abs(diff);

            // Mostrar hasta 2 tarjetas a cada lado (5 en total)
            if (absDiff > 2) {
              return null;
            }

            // Clases de posición y escala para el abanico amplio del sample
            let positionClasses = '';
            let visualClasses = '';

            if (isActive) {
              // Tarjeta Central (Activa): 100% escala, al frente, sombra cinemática
              positionClasses = 'scale-100 z-30 translate-x-0 cursor-default shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] border-white/20';
              visualClasses = 'opacity-100 brightness-100';
            } else if (diff === -1) {
              // Inmediata izquierda: parcialmente superpuesta detrás de la central
              positionClasses = 'scale-[0.84] sm:scale-[0.82] z-20 -translate-x-[52%] sm:-translate-x-[46%] md:-translate-x-[42%] cursor-pointer border-white/10 hover:border-white/30';
              visualClasses = 'opacity-55 brightness-60 hover:opacity-75 hover:brightness-75';
            } else if (diff === 1) {
              // Inmediata derecha: parcialmente superpuesta detrás de la central
              positionClasses = 'scale-[0.84] sm:scale-[0.82] z-20 translate-x-[52%] sm:translate-x-[46%] md:translate-x-[42%] cursor-pointer border-white/10 hover:border-white/30';
              visualClasses = 'opacity-55 brightness-60 hover:opacity-75 hover:brightness-75';
            } else if (diff === -2) {
              // Segunda a la izquierda: más afuera, fundiéndose con la viñeta izquierda
              positionClasses = 'scale-[0.70] sm:scale-[0.68] z-10 -translate-x-[98%] sm:-translate-x-[86%] md:-translate-x-[76%] cursor-pointer border-white/5';
              visualClasses = 'opacity-35 brightness-45 hidden sm:block hover:opacity-50';
            } else if (diff === 2) {
              // Segunda a la derecha: más afuera, fundiéndose con la viñeta derecha
              positionClasses = 'scale-[0.70] sm:scale-[0.68] z-10 translate-x-[98%] sm:translate-x-[86%] md:translate-x-[76%] cursor-pointer border-white/5';
              visualClasses = 'opacity-35 brightness-45 hidden sm:block hover:opacity-50';
            }

            return (
              <div
                key={post.id || idx}
                onClick={() => {
                  if (!isActive) setActiveIndex(idx);
                }}
                className={`absolute w-72 sm:w-84 md:w-96 aspect-2/3 rounded-2xl md:rounded-3xl overflow-hidden border transition-all duration-500 ease-out ${positionClasses} ${visualClasses}`}
              >
                {/* Imagen Base Pura al 100% de brillo */}
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />

                {/* Scrim Localizado inferior */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black via-black/80 to-transparent pointer-events-none" />

                {/* Badge Superior */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 rounded-full text-[7.5px] tracking-[0.3em] uppercase font-mono bg-black/75 backdrop-blur-md text-amber-400 border border-amber-400/30">
                    {post.collectionLabel || 'Editorial'}
                  </span>
                </div>

                {/* Contenedor del Texto */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end z-20">
                  {post.date && (
                    <span className="text-[8px] font-mono tracking-widest text-white/50 mb-1.5 uppercase block">
                      {post.date}
                    </span>
                  )}

                  {/* Título Cinzel sin text-shadow */}
                  <h3 
                    style={{ fontFamily: "'Cinzel', 'Libre Bodoni', Georgia, serif" }}
                    className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide text-white mix-blend-plus-lighter leading-tight uppercase line-clamp-2 mb-4"
                  >
                    {post.title}
                  </h3>

                  {post.subtitle && (
                    <p className="text-xs text-white/70 font-light line-clamp-2 mb-4 leading-relaxed">
                      {post.subtitle}
                    </p>
                  )}

                  {/* Botón CTA Dorado tipo 'WATCH NOW' (como en el sample) */}
                  {isActive && (
                    <a
                      href={post.link}
                      className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-md bg-[#f5b800] hover:bg-[#e0a700] text-black font-mono font-extrabold text-[10px] sm:text-[11px] uppercase tracking-[0.25em] transition-all shadow-[0_4px_20px_rgba(245,184,0,0.35)] hover:shadow-[0_6px_25px_rgba(245,184,0,0.5)] active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                      </svg>
                      <span>{ctaText}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Flecha Anterior (<): Más grande, elegante y estilizada (como en sample) ── */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Anterior"
          className="absolute left-2 sm:left-6 md:left-10 lg:left-14 z-40 p-2 sm:p-3 text-white/75 hover:text-white transition-all duration-300 hover:scale-125 active:scale-95 cursor-pointer drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
        >
          <svg className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* ── Flecha Siguiente (>): Más grande, elegante y estilizada (como en sample) ── */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Siguiente"
          className="absolute right-2 sm:right-6 md:right-10 lg:right-14 z-40 p-2 sm:p-3 text-white/75 hover:text-white transition-all duration-300 hover:scale-125 active:scale-95 cursor-pointer drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
        >
          <svg className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Dots de navegación discretos */}
      <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6 relative z-30">
        {posts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Ir a publicación ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === activeIndex
                ? 'w-7 h-1.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
