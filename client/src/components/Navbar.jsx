import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, Wallet, ShieldCheck, LogOut, ChevronDown, User as UserIcon, ArrowDownCircle, ArrowUpCircle, Gamepad2, X } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, openLogin, openRegister, logout } = useContext(AuthContext);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (viewName) => {
    if (!user && (viewName === 'deposit' || viewName === 'withdrawal' || viewName === 'profile' || viewName === 'admin')) {
      openLogin();
      return;
    }
    setCurrentView(viewName);
  };

  return (
    <header className="w-full bg-[#080b11]/95 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
      {/* Left: Brand Logo & Navigation */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="Toggle mobile navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('game')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-pink-600 to-rose-700 flex items-center justify-center font-black text-white text-base shadow-md shadow-rose-900/30 group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-wider text-white font-['Outfit'] leading-none">
              METRIC<span className="text-emerald-400">WIN</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">AVIATOR PRO</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 ml-4 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleNavClick('game')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'game' 
                ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AVIATOR GAME
          </button>
          <button
            onClick={() => handleNavClick('deposit')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'deposit' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            DEPOSIT
          </button>
          <button
            onClick={() => handleNavClick('withdrawal')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'withdrawal' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            WITHDRAWAL
          </button>
          <button
            onClick={() => handleNavClick('profile')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            PROFILE
          </button>
          <button
            onClick={() => handleNavClick('chat')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all font-['Outfit'] min-h-[36px] ${
              currentView === 'chat' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-cyan-400 hover:text-cyan-200'
            }`}
          >
            CHAT / RAIN
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all font-['Outfit'] min-h-[36px] ${
                currentView === 'admin' ? 'bg-purple-900/80 text-purple-200' : 'text-purple-400 hover:text-purple-200'
              }`}
            >
              ADMIN
            </button>
          )}
        </nav>
      </div>

      {/* Right: Auth & User Balance Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <div className="flex items-center gap-2">
            {/* User Balance Counter Pill */}
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
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

            {/* Profile Dropdown Menu */}
            <div className="relative">
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

                  {user.role === 'admin' && (
                    <button
                      onClick={() => { setCurrentView('admin'); setProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-purple-400 hover:bg-purple-950/40 rounded-xl transition-colors flex items-center gap-2 min-h-[36px]"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Console
                    </button>
                  )}

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => { logout(); setProfileDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-2 min-h-[36px]"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={openLogin}
              className="px-3.5 py-2 text-xs font-extrabold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-xl transition-all font-['Outfit'] min-h-[40px]"
            >
              LOG IN
            </button>
            <button
              onClick={openRegister}
              className="px-3.5 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-md shadow-emerald-950/40 transition-all font-['Outfit'] active:scale-95 min-h-[40px]"
            >
              REGISTER
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bg-slate-950/95 border-b border-slate-800 p-4 shadow-2xl z-40 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { handleNavClick('game'); setMobileMenuOpen(false); }}
              className={`p-3 text-left text-xs font-extrabold rounded-xl font-['Outfit'] flex items-center gap-2 min-h-[44px] ${
                currentView === 'game' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>AVIATOR GAME</span>
            </button>
            <button
              onClick={() => { handleNavClick('deposit'); setMobileMenuOpen(false); }}
              className={`p-3 text-left text-xs font-bold rounded-xl flex items-center justify-between min-h-[44px] ${
                currentView === 'deposit' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-300 bg-slate-900'
              }`}
            >
              <span>DEPOSIT FUNDS</span>
              <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => { handleNavClick('withdrawal'); setMobileMenuOpen(false); }}
              className={`p-3 text-left text-xs font-bold rounded-xl flex items-center justify-between min-h-[44px] ${
                currentView === 'withdrawal' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-300 bg-slate-900'
              }`}
            >
              <span>WITHDRAW FUNDS</span>
              <ArrowUpCircle className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => { handleNavClick('profile'); setMobileMenuOpen(false); }}
              className={`p-3 text-left text-xs font-bold rounded-xl flex items-center justify-between min-h-[44px] ${
                currentView === 'profile' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-300 bg-slate-900'
              }`}
            >
              <span>MY ACCOUNT PROFILE</span>
              <UserIcon className="w-4 h-4 text-slate-400" />
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => { handleNavClick('admin'); setMobileMenuOpen(false); }}
                className="p-3 text-left text-xs font-bold text-purple-400 bg-slate-900 rounded-xl flex items-center justify-between min-h-[44px]"
              >
                <span>ADMIN CONSOLE</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
