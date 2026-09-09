import React, { useState } from 'react';

export interface GalleryCardProps {
  image: string;
  title: string;
  author: string;
  region: string;
  year: string | number;
  excerpt: string;
  tags?: string;
  href?: string;
  theme?: 'light' | 'dark' | 'tgp';
  badge?: string;
  videoUrl?: string;
  onWatch?: () => void;
  onBookmark?: () => void;
}

export default function GalleryCard({
  image,
  title,
  author,
  region,
  year,
  excerpt,
  tags = "HD | 120' | ESPAÑOL | ARCHIVO",
  href,
  theme = 'light',
  badge,
  videoUrl,
  onWatch,
  onBookmark,
}: GalleryCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark();
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    if (onWatch) {
      e.preventDefault();
      e.stopPropagation();
      onWatch();
    }
  };

  // Define theme classes for the expanded card panel
  const isLight = theme === 'light';
  const containerBg = isLight ? 'bg-white text-black' : 'bg-[#0e0e11] text-white border border-white/10';
  const excerptText = isLight ? 'text-gray-800' : 'text-gray-300';
  const metaText = isLight ? 'text-gray-500 border-gray-200' : 'text-gray-400 border-white/10';
  const iconBtnBorder = isLight 
    ? 'border-gray-300 text-gray-700 hover:border-black hover:text-black hover:bg-gray-100' 
    : 'border-white/20 text-white/80 hover:border-white hover:text-white hover:bg-white/10';

  // Contenedor Base: Mantiene el espacio exacto en la grilla sin descolocar el layout
  return (
    <div className="relative group w-full aspect-video cursor-pointer">
      
      {/* 1. Estado Reposo (Visible por defecto) */}
      <div className="w-full h-full overflow-hidden bg-zinc-900 rounded-sm shadow-md transition-all duration-300 group-hover:opacity-0">
        <img 
          src={image} 
          alt={title} 
          loading="lazy"
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500 ease-out" 
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent p-4 flex flex-col justify-end">
          {badge && (
            <span className="inline-block self-start mb-auto text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/30 rounded-xs">
              {badge}
            </span>
          )}
          <h3 className="text-white font-bold text-base sm:text-lg leading-tight line-clamp-1 group-hover:text-amber-200 transition-colors">
            {title}
          </h3>
          <p className="text-gray-300 text-[10px] tracking-widest uppercase mt-1 font-mono flex items-center gap-1.5 opacity-80">
            <span>{author}</span>
            {region && <span>• {region}</span>}
            {year && <span>• {year}</span>}
          </p>
        </div>
      </div>

      {/* 2. Estado Expandido (Pop-out emergente on Hover sin romper layout) */}
      <div 
        className={`absolute top-0 left-0 w-full min-w-[110%] ml-[-5%] rounded-sm shadow-2xl 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                    transition-all duration-300 group-hover:delay-200 z-50 
                    scale-95 group-hover:scale-100 origin-top overflow-hidden ${containerBg}`}
      >
         {/* Área Visual (Imagen o Preview) */}
         <div className="relative w-full aspect-video bg-black overflow-hidden">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                poster={image} 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover rounded-t-sm"
              />
            ) : (
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover rounded-t-sm group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            )}
            
            {/* Tag/Badge opcional en esquina */}
            {badge && (
              <span className="absolute top-3 left-3 text-[9px] font-mono tracking-wider uppercase px-2 py-1 bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30 rounded-xs z-10">
                {badge}
              </span>
            )}

            {/* Gradient Overlay inferior con Título */}
            <div className="absolute bottom-0 left-0 p-4 bg-linear-to-t from-black/95 via-black/60 to-transparent w-full">
              <h3 className="text-white font-bold text-lg leading-tight tracking-wide drop-shadow-sm">
                {title}
              </h3>
              <p className="text-gray-300 text-[10px] tracking-widest uppercase mt-0.5 font-mono">
                {author} {region && `| ${region}`} {year && `| ${year}`}
              </p>
            </div>
         </div>

         {/* Panel de Información (Estilo MUBI / Editorial TGP) */}
         <div className="p-5">
            {/* Barra de Acciones */}
            <div className="flex items-center gap-2 mb-3">
               {href ? (
                 <a 
                   href={href} 
                   onClick={handleWatchClick}
                   className="bg-blue-800 text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                 >
                    <span>▶</span> VER
                 </a>
               ) : (
                 <button 
                   onClick={handleWatchClick}
                   className="bg-blue-800 text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                 >
                    <span>▶</span> VER
                 </button>
               )}

               <button 
                 onClick={handleBookmarkClick}
                 title={isBookmarked ? "Guardado" : "Añadir a mi lista"}
                 className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${iconBtnBorder} ${isBookmarked ? 'bg-amber-500 border-amber-500 text-black' : ''}`}
               >
                 {isBookmarked ? '✓' : '+'}
               </button>
            </div>
            
            {/* Excerpt / Sinopsis Ensayística */}
            <p className={`text-xs sm:text-sm leading-relaxed font-serif text-pretty ${excerptText} line-clamp-4`}>
              {excerpt}
            </p>
            
            {/* Especificaciones Técnicas / Tags */}
            <div className={`mt-4 pt-3 border-t text-[10px] font-mono tracking-wider flex items-center justify-between ${metaText}`}>
              <span>{tags}</span>
              {href && (
                <a href={href} className="underline hover:opacity-100 opacity-70 transition-opacity">
                  Leer Ensayo →
                </a>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}
