import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ArrowDownCircle, ArrowUpCircle, Gamepad2, CloudRain, User } from 'lucide-react';

export const BottomNavbar = ({ currentView, setCurrentView, openChatRain }) => {
  const { user, openLogin } = useContext(AuthContext);

  const handleAction = (viewName) => {
    if (!user && (viewName === 'deposit' || viewName === 'withdrawal' || viewName === 'profile')) {
      openLogin();
      return;
    }
    setCurrentView(viewName);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#080b11]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl px-2 py-1.5 sm:px-6 md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* 1. Deposit Button */}
        <button
          onClick={() => handleAction('deposit')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'deposit' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Deposit funds"
        >
          <ArrowDownCircle className="w-5 h-5 shrink-0" />
          <span className="text-[10px] font-bold font-['Outfit'] tracking-wider uppercase">Deposit</span>
        </button>

        {/* 2. Withdraw Button */}
        <button
          onClick={() => handleAction('withdrawal')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'withdrawal' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Withdraw funds"
        >
          <ArrowUpCircle className="w-5 h-5 shrink-0" />
          <span className="text-[10px] font-bold font-['Outfit'] tracking-wider uppercase">Withdraw</span>
        </button>

        {/* 3. Center Prominent Floating "PLAY GAME" Button */}
        <div className="relative -mt-6 flex flex-col items-center justify-center">
          <button
            onClick={() => handleAction('game')}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/40 ring-4 ring-[#080b11] transition-transform active:scale-95 ${
              currentView === 'game' ? 'scale-105 ring-emerald-500/50' : 'hover:scale-105'
            }`}
            aria-label="Play Aviator Game"
          >
            <Gamepad2 className="w-7 h-7 text-slate-950 animate-pulse" />
          </button>
          <span className="text-[9px] font-black font-['Outfit'] tracking-widest text-emerald-400 uppercase mt-1">
            PLAY GAME
          </span>
        </div>

        {/* 4. Chat / Rain Drop Button */}
        <button
          onClick={openChatRain}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 transition-all min-w-[56px] py-1 relative"
          aria-label="Open Live Chat and Rain drops"
        >
          <div className="relative">
            <CloudRain className="w-5 h-5 shrink-0 text-cyan-400" />
            <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-cyan-500 text-slate-950 text-[8px] font-black rounded-full leading-none animate-bounce">
              RAIN
            </span>
          </div>
          <span className="text-[10px] font-bold font-['Outfit'] tracking-wider uppercase">Rain / Chat</span>
        </button>

        {/* 5. Profile Button */}
        <button
          onClick={() => handleAction('profile')}
          className={`flex flex-col items-center justify-center gap-1 transition-all min-w-[56px] py-1 ${
            currentView === 'profile' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="User account profile"
        >
          <User className="w-5 h-5 shrink-0" />
          <span className="text-[10px] font-bold font-['Outfit'] tracking-wider uppercase">Profile</span>
        </button>
      </div>
    </div>
  );
};
