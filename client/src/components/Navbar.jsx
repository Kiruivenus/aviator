import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ArrowDownCircle, ArrowUpCircle, User as UserIcon, LogOut, ChevronDown, Menu, X } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout, openLogin } = useContext(AuthContext);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (viewName) => {
    if (!user && (viewName === 'deposit' || viewName === 'withdrawal' || viewName === 'profile')) {
      openLogin();
      return;
    }
    setCurrentView(viewName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080b11]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div 
          onClick={() => setCurrentView('game')} 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-950/60 group-hover:scale-105 transition-transform font-['Outfit']">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-wider text-white font-['Outfit'] leading-none">
              METRIC<span className="text-emerald-400">WIN</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">AVIATOR PRO</span>
          </div>
        </div>

        {/* Center Navigation Links (AVIATOR Button with Red Airplane Logo Image in Center) */}
        <nav className="hidden md:flex items-center justify-center gap-1.5 mx-auto bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => handleNavClick('deposit')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'deposit' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            DEPOSIT
          </button>

          <button
            onClick={() => handleNavClick('withdrawal')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'withdrawal' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            WITHDRAW
          </button>

          {/* AVIATOR (Featured Center Button with Red Airplane Logo Image!) */}
          <button
            onClick={() => handleNavClick('game')}
            className={`px-4 py-1 text-xs font-black rounded-xl transition-all font-['Outfit'] min-h-[36px] flex items-center gap-2 ${
              currentView === 'game' 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/80 ring-2 ring-rose-500/50' 
                : 'bg-rose-950/60 border border-rose-600/40 text-rose-300 hover:bg-rose-900/80 hover:text-white'
            }`}
          >
            <img 
              src="/aviator_plane.png" 
              alt="Aviator Plane" 
              className="w-6 h-6 object-contain filter drop-shadow brightness-125 hover:scale-110 transition-transform" 
            />
            <span>AVIATOR</span>
          </button>

          <button
            onClick={() => handleNavClick('chat')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'chat' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-md' : 'text-cyan-400 hover:text-cyan-200'
            }`}
          >
            CHAT / RAIN DROP
          </button>

          <button
            onClick={() => handleNavClick('prediction')}
            className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'prediction' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md' : 'text-cyan-400 hover:text-cyan-200'
            }`}
          >
            PREDICTOR
          </button>

          {/* PROFILE (Moved to corner!) */}
          <button
            onClick={() => handleNavClick('profile')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'profile' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            PROFILE
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all font-['Outfit'] min-h-[36px] ${
                currentView === 'admin' ? 'bg-purple-900/80 text-purple-200 shadow-md' : 'text-purple-400 hover:text-purple-200'
              }`}
            >
              ADMIN
            </button>
          )}
        </nav>

        {/* Right: Auth & User Balance Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!user ? (
            <button
              onClick={openLogin}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-950/50 transition-all font-['Outfit'] uppercase tracking-wider active:scale-95 min-h-[38px]"
            >
              LOGIN / REGISTER
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {/* Wallet Balance Badge */}
              <div className="bg-[#0f121d] border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-inner">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">BALANCE</span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono leading-tight">
                    KES {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Deposit CTA Button */}
              <button
                onClick={() => handleNavClick('deposit')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-950/40 transition-all font-['Outfit'] flex items-center gap-1.5 active:scale-95 min-h-[40px]"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span className="hidden sm:inline">DEPOSIT</span>
              </button>

              {/* Profile Dropdown Menu (Hidden on smartphone) */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 transition-colors min-h-[40px]"
                  aria-expanded={profileDropdown}
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Content */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <span className="block text-xs font-extrabold text-white truncate">{user.fullName || 'Player'}</span>
                      <span className="block text-[10px] text-slate-400 font-mono truncate">{user.phone}</span>
                    </div>

                    <button
                      onClick={() => { setCurrentView('profile'); setProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 min-h-[36px]"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Account Profile
                    </button>

                    <button
                      onClick={() => { setCurrentView('deposit'); setProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 min-h-[36px]"
                    >
                      <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                      Deposit Funds
                    </button>

                    <button
                      onClick={() => { setCurrentView('withdrawal'); setProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 min-h-[36px]"
                    >
                      <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                      Withdraw Funds
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => { logout(); setProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-2 min-h-[36px]"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#080b11] px-4 py-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => handleNavClick('game')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-extrabold text-xs font-['Outfit'] flex items-center gap-2 min-h-[40px] ${
              currentView === 'game' ? 'bg-rose-600 text-white font-black' : 'text-rose-400 hover:bg-slate-900'
            }`}
          >
            <img src="/aviator_plane.png" alt="Aviator" className="w-5 h-5 object-contain" />
            <span>AVIATOR</span>
          </button>
          <button
            onClick={() => handleNavClick('deposit')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs font-['Outfit'] min-h-[40px] ${
              currentView === 'deposit' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            DEPOSIT
          </button>
          <button
            onClick={() => handleNavClick('withdrawal')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs font-['Outfit'] min-h-[40px] ${
              currentView === 'withdrawal' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            WITHDRAW
          </button>
          <button
            onClick={() => handleNavClick('chat')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs font-['Outfit'] min-h-[40px] ${
              currentView === 'chat' ? 'bg-cyan-950 text-cyan-300 font-black' : 'text-cyan-400 hover:bg-slate-900'
            }`}
          >
            CHAT / RAIN DROP
          </button>
          <button
            onClick={() => handleNavClick('prediction')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-black text-xs font-['Outfit'] min-h-[40px] ${
              currentView === 'prediction' ? 'bg-cyan-500 text-slate-950' : 'text-cyan-400 hover:bg-slate-900'
            }`}
          >
            PREDICTOR
          </button>
          <button
            onClick={() => handleNavClick('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs font-['Outfit'] min-h-[40px] ${
              currentView === 'profile' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            PROFILE
          </button>

          {user && (
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-rose-400 hover:bg-rose-950/40 min-h-[40px]"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};
