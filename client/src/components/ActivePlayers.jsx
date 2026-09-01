import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const PLAYER_NAMES = [
  '2***0', '2***4', '2***3', '2***5', '2***8', '2***1', '2***9', '2***2',
  'P***k', 'A***x', '0712***', 'S***h', 'D***o', '0794***', 'M***k', 'J***n'
];

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80'
];

const PRESET_STAKES = [1000, 2500, 3500, 5000, 8000, 10000, 15000, 25000];

const generateSimulatedPlayers = (count = 420) => {
  const list = [];
  for (let i = 0; i < count; i++) {
    const namePrefix = PLAYER_NAMES[i % PLAYER_NAMES.length];
    const avatar = AVATARS[i % AVATARS.length];
    const amount = PRESET_STAKES[Math.floor(Math.random() * PRESET_STAKES.length)];
    const isCashedOut = Math.random() > 0.35;
    const mult = parseFloat((1.1 + Math.random() * 5.5).toFixed(2));

    list.push({
      id: `sim_${i}_${Date.now()}`,
      userName: namePrefix,
      avatar: avatar,
      amount: amount,
      status: isCashedOut ? 'cashed_out' : 'active',
      cashoutMultiplier: isCashedOut ? mult : null,
      winAmount: isCashedOut ? Math.round(amount * mult) : 0
    });
  }
  return list;
};

export const ActivePlayers = ({ activeBets = [], myBets = [] }) => {
  const [tab, setTab] = useState('ALL');
  const [simulatedBets, setSimulatedBets] = useState(() => generateSimulatedPlayers(420));
  const [activeCount, setActiveCount] = useState(3690);

  // Fluctuating active players count ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount((prev) => {
        const delta = Math.floor(Math.random() * 11) - 5;
        return Math.max(3600, Math.min(3800, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const allCombinedBets = [...(activeBets || []), ...simulatedBets];

  const getDisplayedBets = () => {
    if (tab === 'PREVIOUS') return myBets || [];
    if (tab === 'TOP') return [...allCombinedBets].sort((a, b) => (b.winAmount || 0) - (a.winAmount || 0));
    return allCombinedBets;
  };

  const displayedBets = getDisplayedBets();

  return (
    <div className="w-full lg:w-80 bg-[#12151e] border-t lg:border-t-0 lg:border-r border-slate-800/80 rounded-2xl sm:rounded-3xl p-3 flex flex-col h-full shrink-0 shadow-2xl space-y-3">
      {/* 1. Header Segmented Pill Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#0b0d14] p-1 rounded-full border border-slate-800/60 inline-flex items-center gap-1 w-full justify-around">
          <button
            onClick={() => setTab('ALL')}
            className={`px-5 py-1.5 text-xs font-black rounded-full transition-all font-['Outfit'] ${
              tab === 'ALL' ? 'bg-[#282b36] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bets
          </button>
          <button
            onClick={() => setTab('PREVIOUS')}
            className={`px-5 py-1.5 text-xs font-black rounded-full transition-all font-['Outfit'] ${
              tab === 'PREVIOUS' ? 'bg-[#282b36] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setTab('TOP')}
            className={`px-5 py-1.5 text-xs font-black rounded-full transition-all font-['Outfit'] ${
              tab === 'TOP' ? 'bg-[#282b36] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top
          </button>
        </div>
      </div>

      {/* 2. ALL BETS Title & Live Counter */}
      <div className="px-1 pt-1">
        <h3 className="text-sm font-black text-white uppercase tracking-wider font-['Outfit']">
          ALL BETS
        </h3>
        <span className="text-lg font-black text-[#34c759] font-mono">
          {activeCount.toLocaleString()}
        </span>
      </div>

      {/* 3. Table Column Headers */}
      <div className="grid grid-cols-12 px-2 py-1 text-[10px] font-extrabold text-slate-400 border-b border-slate-800/80 uppercase font-['Outfit']">
        <div className="col-span-4">Player</div>
        <div className="col-span-3 text-right">Bet KES</div>
        <div className="col-span-2 text-center">X</div>
        <div className="col-span-3 text-right">Win KES</div>
      </div>

      {/* 4. Table Rows with Independent Scroll Isolation */}
      <div className="flex-1 overflow-y-auto max-h-[380px] lg:max-h-[500px] xl:max-h-[620px] space-y-1.5 pr-1 overscroll-contain">
        {displayedBets.map((bet, index) => {
          const isCashedOut = bet.status === 'cashed_out';
          return (
            <div
              key={bet.id || index}
              className={`grid grid-cols-12 px-3 py-2 items-center rounded-xl transition-colors ${
                isCashedOut ? 'bg-[#122b13] border border-[#34c759]/30 text-white' : 'bg-[#161a24] text-slate-300'
              }`}
            >
              {/* Player Handle with Avatar */}
              <div className="col-span-4 flex items-center gap-2 truncate">
                {bet.avatar ? (
                  <img src={bet.avatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-700" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                    <User className="w-3 h-3 text-slate-400" />
                  </div>
                )}
                <span className="font-bold text-white truncate text-xs font-mono">
                  {bet.userName || bet.userPhone || 'Player'}
                </span>
              </div>

              {/* Bet KES */}
              <div className="col-span-3 text-right font-mono font-bold text-xs text-slate-200">
                {bet.amount ? bet.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '100.00'}
              </div>

              {/* Multiplier X */}
              <div className="col-span-2 text-center font-mono font-black text-xs">
                {isCashedOut && bet.cashoutMultiplier ? (
                  <span className="text-[#a855f7]">
                    {bet.cashoutMultiplier.toFixed(2)}x
                  </span>
                ) : (
                  <span className="text-slate-600">-</span>
                )}
              </div>

              {/* Win KES */}
              <div className="col-span-3 text-right font-mono font-bold text-xs">
                {isCashedOut && bet.winAmount ? (
                  <span className="text-[#34c759]">
                    {bet.winAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span className="text-slate-600">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
