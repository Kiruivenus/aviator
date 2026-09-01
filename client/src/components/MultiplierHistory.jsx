import React from 'react';

export const MultiplierHistory = ({ history }) => {
  const getBadgeClass = (mult) => {
    if (mult >= 10.0) return 'badge-pill badge-pink shadow-md shadow-pink-900/30 font-black';
    if (mult >= 2.0) return 'badge-pill badge-purple shadow-sm shadow-purple-900/20';
    return 'badge-pill badge-blue';
  };

  return (
    <div className="w-full bg-[#0e1420] border-b border-[#1b263b] px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
      {history && history.map((mult, idx) => (
        <span key={idx} className={getBadgeClass(mult)}>
          {mult.toFixed(2)}x
        </span>
      ))}
    </div>
  );
};
