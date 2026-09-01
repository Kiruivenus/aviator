import React from 'react';
import { History } from 'lucide-react';

export const MultiplierHistory = ({ history }) => {
  const getBadgeStyle = (multiplier) => {
    if (multiplier >= 10.0) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25';
    } else if (multiplier >= 2.0) {
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/25';
    } else {
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25';
    }
  };

  return (
    <div className="w-full bg-[#080b11] border-b border-slate-800/80 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar select-none">
      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase shrink-0 font-['Outfit'] pr-2 border-r border-slate-800">
        <History className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline">HISTORY</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {history && history.length > 0 ? (
          history.map((mult, index) => (
            <span
              key={index}
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold font-mono border transition-transform hover:scale-105 shrink-0 cursor-pointer shadow-sm ${getBadgeStyle(mult)}`}
              title={`Multiplier: ${mult}x`}
            >
              {typeof mult === 'number' ? mult.toFixed(2) : mult}x
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-500 italic">No recent rounds recorded</span>
        )}
      </div>
    </div>
  );
};
