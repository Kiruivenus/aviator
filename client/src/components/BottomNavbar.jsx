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
        
        {/* 1. DEPOSIT (Green Raised Button) */}
        <button
          onClick={() => handleAction('deposit')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'deposit' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Deposit Funds"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
            <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
          </div>
          <span className="text-[9px] font-black font-['Outfit'] tracking-wider uppercase text-emerald-400">DEPOSIT</span>
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

        {/* 3. PROFILE */}
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

        {/* 5. PLAY GAME */}
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

      </div>
    </div>
  );
};
