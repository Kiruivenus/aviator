import React, { useState } from 'react';
import { Users, User, Trophy, TrendingUp } from 'lucide-react';

export const ActivePlayers = ({ activeBets, myBets }) => {
  const [tab, setTab] = useState('ALL');

  const getDisplayedBets = () => {
    if (tab === 'MY BETS') return myBets || [];
    if (tab === 'WINS') return activeBets.filter(b => b.status === 'cashed_out');
    if (tab === 'TOP') return [...activeBets].sort((a, b) => b.winAmount - a.winAmount);
    return activeBets;
  };

  const displayedBets = getDisplayedBets();

  return (
    <div className="w-full lg:w-72 bg-[#0e131d] border-r border-[#1b2538] flex flex-col h-full shrink-0">
      {/* Header Tabs matching screenshot */}
      <div className="p-2 border-b border-[#1b2538]">
        <div className="flex bg-[#141c2c] p-1 rounded-lg border border-[#202c42]">
          <button
            onClick={() => setTab('ALL')}
            className={`flex-1 py-1 text-[11px] font-bold rounded transition-all ${
              tab === 'ALL' ? 'bg-[#202e47] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setTab('MY BETS')}
            className={`flex-1 py-1 text-[11px] font-bold rounded transition-all ${
              tab === 'MY BETS' ? 'bg-[#202e47] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            MY BETS
          </button>
          <button
            onClick={() => setTab('TOP')}
            className={`flex-1 py-1 text-[11px] font-bold rounded transition-all ${
              tab === 'TOP' ? 'bg-[#202e47] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            TOP
          </button>
          <button
            onClick={() => setTab('WINS')}
            className={`flex-1 py-1 text-[11px] font-bold rounded transition-all ${
              tab === 'WINS' ? 'bg-[#202e47] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            WINS
          </button>
        </div>

        {/* Active Player Counter Pill */}
        <div className="mt-2.5 flex items-center justify-between px-2 text-xs">
          <span className="text-gray-400 font-bold text-[10px] tracking-wider">ACTIVE PLAYERS</span>
          <span className="bg-[#192336] text-[#3b82f6] font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-[#273754]">
            {activeBets.length > 0 ? (activeBets.length + 2450).toLocaleString() : '2,466'}
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 px-3 py-2 text-[10px] font-bold text-gray-400 border-b border-[#1b2538] uppercase">
        <div className="col-span-4">Player</div>
        <div className="col-span-3 text-right">Bet KES</div>
        <div className="col-span-2 text-center">X</div>
        <div className="col-span-3 text-right">Win KES</div>
      </div>

      {/* Table Rows matching metricwin screenshot */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#172030] text-xs">
        {displayedBets.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">No active bets in this round</div>
        ) : (
          displayedBets.map((bet, index) => {
            const isCashedOut = bet.status === 'cashed_out';
            return (
              <div
                key={bet.id || index}
                className={`grid grid-cols-12 px-3 py-2 items-center transition-colors hover:bg-[#141b29] ${
                  isCashedOut ? 'bg-emerald-950/20' : ''
                }`}
              >
                {/* Player Handle */}
                <div className="col-span-4 flex items-center gap-1.5 truncate">
                  <div className="w-5 h-5 rounded-full bg-indigo-900/80 border border-indigo-700/60 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-gray-300 truncate text-[11px]">
                    {bet.userName || bet.userPhone || 'Player'}
                  </span>
                </div>

                {/* Bet Amount KES */}
                <div className="col-span-3 text-right font-mono font-medium text-gray-200 text-[11px]">
                  {bet.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                {/* Multiplier X */}
                <div className="col-span-2 text-center">
                  {isCashedOut ? (
                    <span className="bg-[#1b2b3d] text-[#38bdf8] font-bold text-[10px] px-1.5 py-0.5 rounded border border-[#263e59]">
                      {bet.cashoutMultiplier.toFixed(2)}x
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>

                {/* Win Amount KES */}
                <div className="col-span-3 text-right font-mono font-bold text-[11px]">
                  {isCashedOut ? (
                    <span className="text-[#22c55e]">
                      {bet.winAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
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
