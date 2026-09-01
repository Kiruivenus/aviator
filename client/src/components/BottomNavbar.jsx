import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, ArrowUpCircle, User, MessageSquare, Play } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b0d17]/95 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl px-2 py-1.5 sm:px-6 md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        
        {/* 1. DEPOSIT */}
        <button
          onClick={() => handleAction('deposit')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'deposit' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Deposit Funds"
        >
          <Plus className="w-5 h-5 shrink-0 text-emerald-400 stroke-[2.5]" />
          <span className="text-[9px] font-extrabold font-['Outfit'] tracking-wider uppercase text-emerald-400">DEPOSIT</span>
        </button>

        {/* 2. WITHDRAW */}
        <button
          onClick={() => handleAction('withdrawal')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'withdrawal' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Withdraw Funds"
        >
          <ArrowUpCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <span className="text-[9px] font-extrabold font-['Outfit'] tracking-wider uppercase">WITHDRAW</span>
        </button>

        {/* 3. CENTER RAISED AVIATOR BUTTON (Renamed from PLAY GAME and positioned in the middle!) */}
        <div className="relative -mt-6 flex flex-col items-center justify-center">
          <button
            onClick={() => handleAction('game')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 text-white flex items-center justify-center font-black shadow-lg shadow-rose-600/50 ring-4 ring-[#0b0d17] transition-transform hover:scale-105 active:scale-95"
            aria-label="Launch Aviator Game"
          >
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </button>
          <span className="text-[9px] font-black font-['Outfit'] tracking-widest text-rose-400 uppercase mt-1">
            AVIATOR
          </span>
        </div>

        {/* 4. CHAT / RAIN */}
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

        {/* 5. PROFILE (Moved to corner!) */}
        <button
          onClick={() => handleAction('profile')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'profile' ? 'text-purple-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="View Profile"
        >
          <User className="w-5 h-5 shrink-0 text-purple-400" />
          <span className="text-[9px] font-extrabold font-['Outfit'] tracking-wider uppercase">PROFILE</span>
        </button>

      </div>
    </div>
  );
};
