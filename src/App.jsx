import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  DollarSign, 
  Calendar, 
  ArrowUpRight,
  TrendingUp,
  Info,
  Scale,
  Clock
} from 'lucide-react';

// Componente de Logo inspirado en el Monte Fuji, Pagoda y Sakura
const JapanLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10">
    <circle cx="50" cy="50" r="45" fill="#fff1f2" />
    <path d="M15 80 L50 30 L85 80 Z" fill="#1e293b" />
    <path d="M40 44 L50 30 L60 44 Q50 48 40 44 Z" fill="white" />
    <g transform="translate(55, 45)">
      <rect x="5" y="30" width="22" height="4" rx="1" fill="#991b1b" />
      <rect x="8" y="22" width="16" height="4" rx="1" fill="#991b1b" />
      <rect x="11" y="14" width="10" height="4" rx="1" fill="#991b1b" />
      <rect x="15" y="0" width="2" height="14" rx="0.5" fill="#991b1b" />
    </g>
    <circle cx="20" cy="70" r="3" fill="#fb7185" />
    <circle cx="30" cy="78" r="2" fill="#fda4af" />
    <circle cx="75" cy="75" r="3" fill="#fb7185" />
    <circle cx="85" cy="65" r="2" fill="#fda4af" />
  </svg>
);

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(3600); // Segundos para el próximo refresh

  // Inyectar fuentes Zen
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const fetchData = useCallback(async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const response = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares');
      if (!response.ok) throw new Error('No se pudo obtener la información');
      
      const rawData = await response.json();
      
      const latestByCasa = rawData.reduce((acc, curr) => {
        if (!acc[curr.casa] || new Date(curr.fecha) > new Date(acc[curr.casa].fecha)) {
          acc[curr.casa] = curr;
        }
        return acc;
      }, {});

      const processedData = Object.values(latestByCasa)
        .filter(dolar => dolar.casa.toLowerCase() !== 'solidario')
        .map(dolar => ({
          ...dolar,
          casa: dolar.casa.toLowerCase() === 'contadoconliqui' ? 'CCL' : dolar.casa
        }))
        .sort((a, b) => b.venta - a.venta);
      
      setData(processedData);
      if (processedData.length > 0) {
        setLastUpdated(processedData[0].fecha);
      }
      setLoading(false);
      setNextRefresh(3600); // Reiniciar contador de 1 hora
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Efecto para fetch inicial e intervalo de 1 hora
  useEffect(() => {
    fetchData();

    // Intervalo de actualización cada 1 hora (3600000 ms)
    const apiInterval = setInterval(() => {
      fetchData(true);
    }, 3600000);

    // Intervalo para el contador visual
    const timerInterval = setInterval(() => {
      setNextRefresh(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(apiInterval);
      clearInterval(timerInterval);
    };
  }, [fetchData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const zenStyles = {
    fontFamily: "'Lora', serif",
    titleFont: "'Playfair Display', serif"
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800" style={zenStyles}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-50 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JapanLogo />
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-slate-900 leading-none" style={{ fontFamily: zenStyles.titleFont }}>
                Dólar
              </h1>
              <span className="text-[9px] text-rose-400 font-semibold uppercase tracking-[0.4em] block mt-1">
                Zen Edition
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[8px] text-slate-300 uppercase tracking-widest font-bold">Auto-Refresco</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.floor(nextRefresh / 60)}m {nextRefresh % 60}s
                </span>
             </div>
             <button 
                onClick={() => fetchData()}
                disabled={loading}
                className="group flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors duration-500 disabled:opacity-30"
              >
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Sincronizar</span>
                <RefreshCw size={16} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-12 text-center md:text-left relative">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-rose-50 rounded-full blur-[80px] -z-10 opacity-60"></div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight italic" style={{ fontFamily: zenStyles.titleFont }}>
            Mercado en <span className="text-rose-600 font-bold">Armonía</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
            <div className="flex items-center gap-2 text-slate-400 italic text-xs">
              <Calendar size={12} className="text-rose-300" />
              <span>{lastUpdated ? formatDate(lastUpdated) : 'Conectando...'}</span>
            </div>
            <div className="w-1 h-1 bg-rose-100 rounded-full hidden md:block"></div>
            <div className="flex items-center gap-2 text-slate-400 italic text-xs">
              <Clock size={12} className="text-rose-300" />
              <span>Sincronizado cada hora</span>
            </div>
          </div>
        </section>

        {error ? (
          <div className="max-w-md mx-auto bg-white border border-rose-100 p-10 rounded-[32px] text-center shadow-sm">
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="text-rose-500" size={18} />
            </div>
            <p className="text-base font-medium text-slate-800 mb-2 italic">Error de conexión</p>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-white/50 rounded-[32px] border border-slate-50 animate-pulse shadow-sm"></div>
              ))
            ) : (
              data.map((dolar) => {
                const promedio = (dolar.compra && dolar.venta) ? (dolar.compra + dolar.venta) / 2 : dolar.venta;
                
                return (
                  <div 
                    key={dolar.casa}
                    className="bg-white rounded-[32px] border border-slate-50 p-6 hover:shadow-xl hover:shadow-rose-100/20 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-[9px] font-bold text-rose-300 uppercase tracking-[0.4em] block mb-1">
                            Tipo
                          </span>
                          <h3 className="text-2xl font-bold text-slate-800 capitalize tracking-tight" style={{ fontFamily: zenStyles.titleFont }}>
                            {dolar.casa}
                          </h3>
                        </div>
                        <div className="text-slate-100 group-hover:text-rose-50 transition-colors duration-500">
                          <DollarSign size={28} strokeWidth={1.5} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                          <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest">Compra</p>
                          <p className="text-lg font-medium text-slate-500">
                            {dolar.compra ? formatCurrency(dolar.compra) : '—'}
                          </p>
                        </div>
                        <div className="space-y-1 border-l border-slate-100 pl-4">
                          <p className="text-[9px] font-semibold text-rose-300 uppercase tracking-widest">Venta</p>
                          <p className="text-xl font-bold text-rose-600">
                            {formatCurrency(dolar.venta)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Scale size={8} /> Promedio
                        </span>
                        <span className="text-sm font-semibold text-slate-400 italic">
                          {formatCurrency(promedio)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={12} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Zen</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <footer className="mt-20 text-center py-16 border-t border-rose-50">
          <div className="inline-block relative mb-6">
            <JapanLogo />
            <div className="absolute inset-0 animate-ping bg-rose-50 rounded-full -z-10 opacity-30"></div>
          </div>
          <p className="text-slate-300 text-[9px] font-medium uppercase tracking-[0.5em] mb-4">
            Información: argentinadatos.com
          </p>
          <div className="flex justify-center items-center gap-5 text-[9px] font-semibold text-slate-300 uppercase tracking-widest">
            <span className="hover:text-rose-300 transition-colors">Equilibrio</span>
            <div className="w-1 h-1 bg-rose-50 rounded-full"></div>
            <span className="hover:text-rose-300 transition-colors">Fluidez</span>
            <div className="w-1 h-1 bg-rose-50 rounded-full"></div>
            <span className="hover:text-rose-300 transition-colors">Verdad</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
