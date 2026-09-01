import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Wallet, Play, Plus, LayoutGrid, MessageSquare } from 'lucide-react';

export const BottomNavbar = ({ currentView, setCurrentView }) => {
  const { user, openLogin } = useContext(AuthContext);

  const handleAction = (viewName) => {
    if (!user && (viewName === 'deposit' || viewName === 'withdrawal' || viewName === 'profile')) {
      openLogin();
      return;
    }
    setCurrentView(viewName);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b0d17]/95 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl px-2 py-1.5 sm:px-6">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* 1. WALLET */}
        <button
          onClick={() => handleAction('profile')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'profile' ? 'text-purple-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="View wallet"
        >
          <Wallet className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-extrabold font-['Outfit'] tracking-wider uppercase">WALLET</span>
        </button>

        {/* 2. PLAY GAME */}
        <button
          onClick={() => handleAction('game')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'game' ? 'text-pink-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Play Game"
        >
          <Play className="w-5 h-5 shrink-0 text-pink-400 fill-pink-400/20" />
          <span className="text-[9px] font-extrabold font-['Outfit'] tracking-wider uppercase text-pink-400">PLAY GAME</span>
        </button>

        {/* 3. CENTER RAISED PURPLE DEPOSIT BUTTON */}
        <div className="relative -mt-6 flex flex-col items-center justify-center">
          <button
            onClick={() => handleAction('deposit')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-purple-600/50 ring-4 ring-[#0b0d17] transition-transform hover:scale-105 active:scale-95"
            aria-label="Deposit Funds"
          >
            <Plus className="w-7 h-7 text-white stroke-[3]" />
          </button>
          <span className="text-[9px] font-black font-['Outfit'] tracking-widest text-purple-400 uppercase mt-1">
            DEPOSIT
          </span>
        </div>

        {/* 4. LIVE BETS / MINE & GRID */}
        <button
          onClick={() => handleAction('game')}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 transition-all min-w-[56px] py-1"
          aria-label="Live Bets Grid"
        >
          <LayoutGrid className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-extrabold font-['Outfit'] tracking-wider uppercase">MINE & GRID</span>
        </button>

        {/* 5. CHAT/RAIN */}
        <button
          onClick={() => handleAction('chat')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'chat' ? 'text-cyan-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Open Chat and Rain page"
        >
          <MessageSquare className="w-5 h-5 shrink-0 text-cyan-400" />
          <span className="text-[9px] font-extrabold font-['Outfit'] tracking-wider uppercase text-cyan-400">CHAT/RAIN</span>
        </button>
      </div>
    </div>
  );
};
