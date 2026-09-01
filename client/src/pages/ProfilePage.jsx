import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { User, Save, CheckCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const ProfilePage = ({ setCurrentView }) => {
  const { user, fetchUser } = useContext(AuthContext);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState('bets'); // 'bets', 'deposits', 'withdrawals'
  
  const [bets, setBets] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const [betsRes, depRes, withRes] = await Promise.all([
        api.get('/bets/my-bets'),
        api.get('/deposit/my-deposits'),
        api.get('/withdrawal/my-withdrawals')
      ]);
      setBets(betsRes.data.bets || []);
      setDeposits(depRes.data.deposits || []);
      setWithdrawals(withRes.data.withdrawals || []);
    } catch (err) {
      console.error('Error loading profile history:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.put('/auth/profile', { fullName, newPassword });
      setMessage('Profile details updated successfully!');
      fetchUser();
      setNewPassword('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium">
        Please log in to view your profile management portal.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 border border-emerald-400/40 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
              {user.fullName}
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase font-['Outfit'] ${
                user.role === 'admin' ? 'bg-purple-950/80 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {user.role}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.phone}</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-6 shadow-inner w-full md:w-auto justify-between md:justify-start">
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider font-['Outfit']">AVAILABLE BALANCE</div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              KES {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setCurrentView('deposit')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all font-['Outfit'] min-h-[32px]"
            >
              DEPOSIT
            </button>
            <button
              onClick={() => setCurrentView('withdrawal')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-slate-800 transition-all font-['Outfit'] min-h-[32px]"
            >
              WITHDRAW
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Edit Profile & History Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Update Details */}
        <div className="lg:col-span-5 bg-[#101622] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
          <h2 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-emerald-400" />
            ACCOUNT DETAILS
          </h2>

          {message && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1 font-['Outfit'] uppercase">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1 font-['Outfit'] uppercase">REGISTERED PHONE (LOCKED)</label>
              <input
                type="text"
                disabled
                value={user.phone}
                className="w-full bg-slate-900 border border-slate-800/60 rounded-xl px-4 py-2.5 text-sm text-slate-500 font-mono cursor-not-allowed min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1 font-['Outfit'] uppercase">NEW PASSWORD (OPTIONAL)</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-['Outfit'] shadow-md min-h-[44px] uppercase tracking-wider"
            >
              <Save className="w-4 h-4" />
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </form>
        </div>

        {/* Right Column: History Log Tabs */}
        <div className="lg:col-span-7 bg-[#101622] border border-slate-800 rounded-2xl p-6 flex flex-col shadow-lg">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 mb-4">
            <button
              onClick={() => setActiveTab('bets')}
              className={`px-4 py-2.5 font-extrabold text-xs border-b-2 transition-all font-['Outfit'] min-h-[40px] ${
                activeTab === 'bets' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              BET HISTORY ({bets.length})
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-4 py-2.5 font-extrabold text-xs border-b-2 transition-all font-['Outfit'] min-h-[40px] ${
                activeTab === 'deposits' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              DEPOSITS ({deposits.length})
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2.5 font-extrabold text-xs border-b-2 transition-all font-['Outfit'] min-h-[40px] ${
                activeTab === 'withdrawals' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              WITHDRAWALS ({withdrawals.length})
            </button>
          </div>

          {/* History Content */}
          <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-slate-800/40 text-xs no-scrollbar">
            {activeTab === 'bets' && (
              bets.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No bets placed yet.</div>
              ) : (
                bets.map((b) => (
                  <div key={b._id} className="py-3 px-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white font-mono text-[11px]">Round: {b.roundId}</div>
                      <div className="text-[10px] text-slate-400">{new Date(b.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-slate-300">Bet: KES {b.amount.toFixed(2)}</div>
                      {b.status === 'cashed_out' ? (
                        <div className="font-bold text-emerald-400 font-mono">
                          Won KES {b.winAmount.toFixed(2)} ({b.cashoutMultiplier.toFixed(2)}x)
                        </div>
                      ) : (
                        <div className="font-semibold text-rose-400">Lost</div>
                      )}
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'deposits' && (
              deposits.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No deposits recorded.</div>
              ) : (
                deposits.map((d) => (
                  <div key={d._id} className="py-3 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white uppercase font-['Outfit']">{d.method} DEPOSIT</div>
                        <div className="text-[10px] text-slate-400">{new Date(d.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">+ KES {d.amount.toFixed(2)}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'withdrawals' && (
              withdrawals.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No withdrawal history.</div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w._id} className="py-3 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold text-white uppercase font-['Outfit']">{w.method} WITHDRAWAL</div>
                        <div className="text-[10px] text-slate-400">{new Date(w.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400">- KES {w.amount.toFixed(2)}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.status === 'completed' ? 'bg-emerald-950 text-emerald-400' : w.status === 'rejected' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {w.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
