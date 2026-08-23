import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const ListenerCounter: React.FC = () => {
  const [listeners, setListeners] = useState(247);

  // Subtle realistic fluctuation for prototype demo
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2 variation
      setListeners((prev) => Math.max(240, Math.min(265, prev + delta)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel-subtle text-amber-200/90 text-xs font-sans-ui border border-amber-500/20 shadow-sm hover:border-amber-500/40 transition-colors"
      title="Demo Listener Indicator"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Users className="w-3.5 h-3.5 text-amber-400/80" />
      <span className="font-medium tracking-wide">
        <span className="text-amber-100 font-semibold">{listeners}</span> listening
      </span>
    </div>
  );
};
