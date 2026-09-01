import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, User as UserIcon, Menu, Wallet, ShieldAlert, LogOut, ChevronDown } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, openLogin, openRegister, logout } = useContext(AuthContext);
  const [profileDropdown, setProfileDropdown] = useState(false);

  return (
    <header className="w-full bg-[#0d121c] border-b border-[#1c2638] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Menu & Brand Logo */}
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-white p-1 rounded-md transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        <div 
          onClick={() => setCurrentView('game')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          {/* Logo Icon matching screenshot */}
          <div className="w-7 h-7 bg-gradient-to-br from-red-600 via-pink-600 to-rose-700 rounded-md flex items-center justify-center font-black text-white text-base shadow-md shadow-red-900/40">
            M
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white font-['Outfit']">
            METRIC<span className="text-gray-400">WIN</span>
          </span>
        </div>
      </div>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-2 bg-[#131a29] px-3 py-1 rounded-lg border border-[#1e2a3f]">
        <button
          onClick={() => setCurrentView('game')}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
            currentView === 'game' ? 'bg-[#22c55e] text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          AVIATOR GAME
        </button>

        {user && (
          <>
            <button
              onClick={() => setCurrentView('deposit')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                currentView === 'deposit' ? 'bg-[#22c55e] text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              DEPOSIT
            </button>
            <button
              onClick={() => setCurrentView('withdrawal')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                currentView === 'withdrawal' ? 'bg-[#22c55e] text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              WITHDRAWAL
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                currentView === 'profile' ? 'bg-[#22c55e] text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              MY PROFILE
            </button>
          </>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={() => setCurrentView('admin')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
              currentView === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-950/60 text-purple-300 border border-purple-800/60 hover:bg-purple-900/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            ADMIN PORTAL
          </button>
        )}
      </div>

      {/* Right: Balance & User Profile / Login */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Balance Badge matching screenshot */}
            <div className="bg-[#141b29] border border-[#212d45] rounded-full px-3.5 py-1 flex items-center gap-2 shadow-inner">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">BALANCE</span>
              <span className="text-sm font-extrabold text-[#22c55e] font-['Outfit']">
                KES {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Quick Deposit button */}
            <button
              onClick={() => setCurrentView('deposit')}
              className="hidden sm:flex items-center gap-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-xs px-3 py-1.5 rounded-full transition-all shadow-md shadow-green-950/40"
            >
              <Wallet className="w-3.5 h-3.5" />
              DEPOSIT
            </button>

            {/* Notification Bell */}
            <button className="text-gray-400 hover:text-white bg-[#141b29] border border-[#212d45] p-2 rounded-full relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-800 border border-emerald-500/40 flex items-center justify-center text-white font-bold text-xs shadow-md"
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-[#131a29] border border-[#233148] rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#233148]">
                    <div className="font-bold text-white truncate">{user.fullName}</div>
                    <div className="text-gray-400 font-mono">{user.phone}</div>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.role === 'admin' ? 'bg-purple-900/60 text-purple-300' : 'bg-blue-900/60 text-blue-300'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setCurrentView('profile'); setProfileDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#1d273a] hover:text-white flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    My Profile
                  </button>

                  <button
                    onClick={() => { setCurrentView('deposit'); setProfileDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#1d273a] hover:text-white flex items-center gap-2"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Deposit M-Pesa / USDT
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => { setCurrentView('admin'); setProfileDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-purple-300 hover:bg-purple-900/30 flex items-center gap-2 font-semibold"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Admin Control Panel
                    </button>
                  )}

                  <div className="border-t border-[#233148] mt-1 pt-1">
                    <button
                      onClick={() => { logout(); setProfileDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-950/30 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={openLogin}
              className="text-gray-300 hover:text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-[#212d45] hover:border-gray-500 transition-all"
            >
              LOG IN
            </button>
            <button
              onClick={openRegister}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-xs px-4 py-1.5 rounded-lg transition-all shadow-md shadow-green-950/50"
            >
              REGISTER
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
