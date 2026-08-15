import React, { useState } from 'react';

const DESCRIPCIONES_GEMAS: Record<string, string> = {
  'ensayo_html': 'Genera un Ensayo estructurado con títulos, subtítulos, citas, pies de página y reflexión.',
  'redes_sociales': 'Crea hilos de X (Twitter), posts para LinkedIn y copies para Instagram adaptados al tono de tu análisis.',
  'gbp_post': 'Estructura una actualización comercial optimizada para Google Business Profile, incluyendo llamados a la acción.',
  'resena_historica': 'Desarrolla un análisis crítico visual y arqueológico profundo (Para Visual Signals).'
};

export default function ScriptoriumDashboard() {
  const [gema, setGema] = useState('ensayo_html');
  const [prompt, setPrompt] = useState('');
  
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedRedes, setGeneratedRedes] = useState('');
  const [generatedYoutube, setGeneratedYoutube] = useState('');
  const [dynamicTitle, setDynamicTitle] = useState('');

  const [activeTab, setActiveTab] = useState('wikimedia');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Procesando...');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // --- 1. GENERAR TEXTO ---
  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      showToast('Por favor, escribe un prompt o comando antes de generar.');
      return;
    }
    setLoading(true);
    setLoadingText('Gemini está documentando tu informe...');
    
    try {
      const res = await fetch('/api/scriptorium/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: prompt, gemaId: gema })
      });
      const data = await res.json();
      
      if (data.success) {
        setGeneratedContent(data.articulo);
        setGeneratedRedes(data.redes);
        setGeneratedYoutube(data.youtube);
        
        // Extraer título dinámicamente
        let title = "Análisis " + new Date().toISOString().split('T')[0];
        const lineas = data.articulo.split('\n');
        for (let i = 0; i < lineas.length; i++) {
          let linea = lineas[i].trim();
          if (linea.startsWith('#') || (linea.startsWith('**') && linea.endsWith('**'))) {
            let limpio = linea.replace(/^#+\s*/, '').replace(/\*\*|__/g, '').trim();
            if (limpio.length > 3 && limpio.length < 90) {
              title = limpio;
              break;
            }
          }
        }
        setDynamicTitle(title);
        showToast('Informe generado con éxito.');
      } else {
        showToast(`Error de Gemini: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Fallo de red: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. BUSCAR IMÁGENES ---
  const handleSearchImages = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setLoadingText('Gemini purificando término y rastreando en Wikimedia...');
    
    try {
      const res = await fetch(`/api/scriptorium/search-images?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.success) {
        setSearchResults(data.images);
        showToast(`Se encontraron ${data.images.length} imágenes (Filtro: ${data.optimizedTerm})`);
      } else {
        showToast(`Error de Búsqueda: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Fallo de red: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (img: any) => {
    setSelectedImages(prev => {
      const exists = prev.find(i => i.originalUrl === img.originalUrl);
      if (exists) {
        return prev.filter(i => i.originalUrl !== img.originalUrl);
      } else {
        return [...prev, img];
      }
    });
  };

  // --- 3. GUARDAR EN EL PORTAL ---
  const handleSaveToPortal = async () => {
    if (!generatedContent) {
      showToast('No hay contenido generado para guardar.');
      return;
    }
    setLoading(true);
    setLoadingText('Guardando en Portal Local y descargando imágenes...');
    
    try {
      const res = await fetch('/api/scriptorium/save-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dynamicTitle,
          content: generatedContent,
          redes: generatedRedes,
          youtube: generatedYoutube,
          images: selectedImages,
          gemaId: gema
        })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast(`¡Guardado exitoso! Archivo creado en: ${data.mdocPath}`);
        // Reset state
        setGeneratedContent('');
        setSelectedImages([]);
      } else {
        showToast(`Error al guardar: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Fallo de red al guardar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-sans p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 border-b border-[#333] pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-[#c4a484]">📜 Scriptorium</h1>
          <p className="text-xs tracking-widest text-[#888] uppercase mt-1">v2.0 CMS • TGP Engine</p>
        </div>
        {toast && (
          <div className="bg-[#c4a484] text-black px-4 py-2 rounded shadow-lg text-sm font-bold animate-pulse">
            {toast}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda: Generación */}
        <div className="space-y-6">
          
          <div className="bg-[#252526] border border-[#333] rounded-lg p-5">
            <h2 className="text-sm tracking-widest text-[#c4a484] uppercase mb-4 flex items-center gap-2">
              💎 Seleccionar Gema
            </h2>
            <select 
              value={gema} 
              onChange={(e) => setGema(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#444] text-[#d4d4d4] p-2 rounded focus:outline-none focus:border-[#c4a484]"
            >
              <option value="ensayo_html">Ensayo (Académico / Artículo Base)</option>
              <option value="resena_historica">Señal Visual (Reseña Arqueológica)</option>
              <option value="gbp_post">Cápsula (Comercial / Breve)</option>
            </select>
            <p className="text-xs text-[#888] mt-2 italic">{DESCRIPCIONES_GEMAS[gema]}</p>
          </div>

          <div className="bg-[#252526] border border-[#333] rounded-lg p-5">
            <h2 className="text-sm tracking-widest text-[#c4a484] uppercase mb-4 flex items-center gap-2">
              ✍️ Prompt Principal
            </h2>
            <textarea
              className="w-full bg-[#1e1e1e] border border-[#444] text-[#d4d4d4] p-3 rounded h-32 resize-none focus:outline-none focus:border-[#c4a484]"
              placeholder="Ej: 'Pirámides de Egipto y su relación astronómica con el cinturón de Orión...'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button 
                onClick={handleGenerateText}
                disabled={loading}
                className="bg-[#c4a484] text-black px-6 py-2 rounded text-sm font-bold uppercase tracking-wider hover:bg-white transition disabled:opacity-50"
              >
                Generar Contenido
              </button>
            </div>
          </div>

          {generatedContent && (
            <div className="bg-[#252526] border border-[#333] rounded-lg p-5">
              <h2 className="text-sm tracking-widest text-[#c4a484] uppercase mb-4">
                📝 Borrador Generado
              </h2>
              <input 
                type="text" 
                value={dynamicTitle} 
                onChange={(e) => setDynamicTitle(e.target.value)}
                className="w-full bg-transparent border-b border-[#444] text-xl font-serif text-white pb-2 mb-4 focus:outline-none focus:border-[#c4a484]" 
                title="Título detectado automáticamente"
              />
              <div className="h-64 overflow-y-auto pr-2 custom-scrollbar text-sm text-[#bbb] whitespace-pre-wrap">
                {generatedContent}
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Imágenes y Guardado */}
        <div className="space-y-6">
          <div className="bg-[#252526] border border-[#333] rounded-lg p-5">
            <h2 className="text-sm tracking-widest text-[#c4a484] uppercase mb-4">
              🖼️ Fuente de Imagen (Fancybox)
            </h2>
            
            <div className="flex border-b border-[#444] mb-4">
              <button 
                className={`pb-2 px-4 text-sm ${activeTab === 'wikimedia' ? 'text-[#c4a484] border-b-2 border-[#c4a484]' : 'text-[#888]'}`}
                onClick={() => setActiveTab('wikimedia')}
              >
                Wikimedia
              </button>
              <button 
                className={`pb-2 px-4 text-sm ${activeTab === 'photos' ? 'text-[#c4a484] border-b-2 border-[#c4a484]' : 'text-[#888]'}`}
                onClick={() => setActiveTab('photos')}
              >
                Google Photos
              </button>
            </div>

            {activeTab === 'wikimedia' && (
              <>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    className="flex-1 bg-[#1e1e1e] border border-[#444] text-[#d4d4d4] p-2 rounded focus:outline-none focus:border-[#c4a484]"
                    placeholder="Buscar (Ej: Tzolkin Maya)... Gemini optimizará el término"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                  />
                  <button 
                    onClick={handleSearchImages}
                    className="bg-[#333] text-white px-4 py-2 rounded hover:bg-[#444] transition"
                  >
                    🔍
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {searchResults.map((img, idx) => {
                    const isSelected = selectedImages.some(s => s.originalUrl === img.originalUrl);
                    return (
                      <div key={idx} className={`relative group border-2 rounded overflow-hidden cursor-pointer ${isSelected ? 'border-[#c4a484]' : 'border-transparent'}`} onClick={() => toggleImageSelection(img)}>
                        <img src={img.url} alt={img.title} className="w-full h-24 object-cover opacity-80 group-hover:opacity-100 transition" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] p-1 truncate text-white">
                          {img.sizeLabel}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-[#c4a484] text-black w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'photos' && (
              <div className="text-center p-8 text-[#888] text-sm border border-dashed border-[#444] rounded">
                <p>Integración con Google Photos requiere OAuth en la nueva versión de Astro.</p>
                <p className="text-xs mt-2">Próximamente disponible. Usa Wikimedia por ahora.</p>
              </div>
            )}
          </div>

          <div className="bg-[#252526] border border-[#333] rounded-lg p-5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm tracking-widest text-[#c4a484] uppercase">
                🚀 Despliegue Local
              </h2>
              <span className="text-xs bg-[#333] px-2 py-1 rounded">
                {selectedImages.length} img seleccionada(s)
              </span>
            </div>
            <p className="text-xs text-[#888] mb-4">
              Al guardar, se creará el archivo <b>.mdoc</b> y se descargarán las imágenes seleccionadas a la carpeta de assets del portal para su empaquetado.
            </p>
            <button 
              onClick={handleSaveToPortal}
              disabled={loading || !generatedContent}
              className="w-full bg-white text-black py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-[#c4a484] transition disabled:opacity-50"
            >
              Guardar en Portal (Keystatic / Local)
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-[#333] border-t-[#c4a484] rounded-full animate-spin mb-4"></div>
          <p className="text-[#c4a484] font-mono text-sm uppercase tracking-widest">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
