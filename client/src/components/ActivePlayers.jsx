import React, { useState } from 'react';
import { User, Users } from 'lucide-react';

export const ActivePlayers = ({ activeBets, myBets }) => {
  const [tab, setTab] = useState('ALL');

  const getDisplayedBets = () => {
    if (tab === 'MY BETS') return myBets || [];
    if (tab === 'WINS') return activeBets.filter((b) => b.status === 'cashed_out');
    if (tab === 'TOP') return [...activeBets].sort((a, b) => b.winAmount - a.winAmount);
    return activeBets;
  };

  const displayedBets = getDisplayedBets();

  return (
    <div className="w-full lg:w-80 bg-[#080b11] border-r border-slate-800/80 flex flex-col h-full shrink-0">
      {/* Header Tabs */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('ALL')}
            className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all font-['Outfit'] min-h-[32px] ${
              tab === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setTab('MY BETS')}
            className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all font-['Outfit'] min-h-[32px] ${
              tab === 'MY BETS'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MY BETS
          </button>
          <button
            onClick={() => setTab('TOP')}
            className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all font-['Outfit'] min-h-[32px] ${
              tab === 'TOP'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TOP
          </button>
          <button
            onClick={() => setTab('WINS')}
            className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all font-['Outfit'] min-h-[32px] ${
              tab === 'WINS'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WINS
          </button>
        </div>

        {/* Active Players Live Counter */}
        <div className="mt-3 flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-extrabold text-[10px] tracking-wider uppercase font-['Outfit']">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>ACTIVE PLAYERS</span>
          </div>
          <span className="bg-emerald-950/60 text-emerald-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
            {activeBets.length > 0 ? (activeBets.length + 2450).toLocaleString() : '2,466'}
          </span>
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="grid grid-cols-12 px-3 py-2 text-[10px] font-extrabold text-slate-400 border-b border-slate-800/80 uppercase font-['Outfit']">
        <div className="col-span-4">Player</div>
        <div className="col-span-3 text-right">Bet KES</div>
        <div className="col-span-2 text-center">X</div>
        <div className="col-span-3 text-right">Win KES</div>
      </div>

      {/* Table Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 text-xs no-scrollbar">
        {displayedBets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No active bets in this round
          </div>
        ) : (
          displayedBets.map((bet, index) => {
            const isCashedOut = bet.status === 'cashed_out';
            return (
              <div
                key={bet.id || index}
                className={`grid grid-cols-12 px-3 py-2 items-center transition-colors hover:bg-slate-900/60 ${
                  isCashedOut ? 'bg-emerald-950/20' : ''
                }`}
              >
                {/* Player Handle */}
                <div className="col-span-4 flex items-center gap-1.5 truncate">
                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                    <User className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="font-semibold text-slate-300 truncate text-[11px]">
                    {bet.userName || bet.userPhone || 'Player'}
                  </span>
                </div>

                {/* Bet KES */}
                <div className="col-span-3 text-right font-mono font-medium text-slate-200 text-[11px]">
                  {bet.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                {/* Multiplier X */}
                <div className="col-span-2 text-center">
                  {isCashedOut ? (
                    <span className="bg-emerald-950 text-emerald-400 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                      {bet.cashoutMultiplier.toFixed(2)}x
                    </span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </div>

                {/* Win KES */}
                <div className="col-span-3 text-right font-mono font-bold text-[11px]">
                  {isCashedOut ? (
                    <span className="text-emerald-400">
                      {bet.winAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
