import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { User, Wallet, History, Save, ArrowDownCircle, ArrowUpCircle, Gamepad2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage = ({ setCurrentView }) => {
  const { user, updateUserBalance } = useContext(AuthContext);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [activeHistoryTab, setActiveHistoryTab] = useState('bets'); // 'bets', 'deposits', 'withdrawals'
  const [betsHistory, setBetsHistory] = useState([]);
  const [depositsHistory, setDepositsHistory] = useState([]);
  const [withdrawalsHistory, setWithdrawalsHistory] = useState([]);

  useEffect(() => {
    loadUserHistory();
  }, []);

  const loadUserHistory = async () => {
    try {
      const [betsRes, depRes, withRes] = await Promise.all([
        api.get('/bets/my-bets'),
        api.get('/deposit/my-deposits'),
        api.get('/withdrawal/my-withdrawals')
      ]);

      setBetsHistory(betsRes.data.bets || []);
      setDepositsHistory(depRes.data.deposits || []);
      setWithdrawalsHistory(withRes.data.withdrawals || []);
    } catch (err) {
      console.error('Failed to load user history:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/auth/profile', {
        fullName,
        newPassword: newPassword || undefined
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Top Profile Header Card */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-2xl sm:text-3xl shadow-lg shadow-emerald-950/50 shrink-0 font-['Outfit']">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
              {user?.fullName || 'Player Account'}
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md font-extrabold bg-slate-900 text-emerald-400 border border-slate-800 uppercase font-['Outfit']">
                {user?.role || 'USER'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">{user?.phone}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 w-full sm:w-auto flex items-center justify-between sm:justify-end gap-5">
          <div>
            <div className="text-[10px] sm:text-xs font-extrabold text-slate-400 tracking-wider font-['Outfit'] mb-1">AVAILABLE BALANCE</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              KES {user?.balance ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setCurrentView('deposit')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all font-['Outfit'] min-h-[36px]"
            >
              DEPOSIT
            </button>
            <button
              onClick={() => setCurrentView('withdrawal')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all font-['Outfit'] min-h-[36px]"
            >
              WITHDRAW
            </button>
          </div>
        </div>
      </div>

      {/* Account Settings Form Card */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
            <User className="w-5 h-5 text-emerald-400 shrink-0" />
            ACCOUNT DETAILS & SECURITY
          </h2>
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6 sm:space-y-7 max-w-xl mx-auto py-2">
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-200 mb-3 font-['Outfit'] uppercase tracking-wider">
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all min-h-[50px]"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-200 mb-3 font-['Outfit'] uppercase tracking-wider">
              REGISTERED PHONE (LOCKED)
            </label>
            <input
              type="text"
              disabled
              value={user?.phone || ''}
              className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-slate-400 font-mono cursor-not-allowed min-h-[50px]"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-200 mb-3 font-['Outfit'] uppercase tracking-wider">
              NEW PASSWORD (OPTIONAL)
            </label>
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all min-h-[50px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base py-4 rounded-2xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 font-['Outfit'] tracking-wider uppercase min-h-[52px]"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'SAVING...' : 'SAVE CHANGES'}</span>
          </button>
        </form>
      </div>

      {/* Transaction & Bet History Activity Logs */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveHistoryTab('bets')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all font-['Outfit'] flex items-center gap-2 min-h-[42px] ${
              activeHistoryTab === 'bets' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            BET HISTORY ({betsHistory.length})
          </button>

          <button
            onClick={() => setActiveHistoryTab('deposits')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all font-['Outfit'] flex items-center gap-2 min-h-[42px] ${
              activeHistoryTab === 'deposits' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            DEPOSITS ({depositsHistory.length})
          </button>

          <button
            onClick={() => setActiveHistoryTab('withdrawals')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all font-['Outfit'] flex items-center gap-2 min-h-[42px] ${
              activeHistoryTab === 'withdrawals' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            WITHDRAWALS ({withdrawalsHistory.length})
          </button>
        </div>

        {/* History Tab Contents */}
        <div className="overflow-x-auto">
          {activeHistoryTab === 'bets' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800 font-['Outfit']">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Multiplier</th>
                  <th className="p-3 text-right">Win / Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {betsHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500 font-medium">No bets placed yet.</td>
                  </tr>
                ) : (
                  betsHistory.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">{new Date(b.createdAt).toLocaleTimeString()}</td>
                      <td className="p-3 font-mono font-bold text-white">KES {b.amount.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-sky-400">{b.cashoutMultiplier ? `${b.cashoutMultiplier.toFixed(2)}x` : '-'}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        {b.winAmount > 0 ? (
                          <span className="text-emerald-400">+KES {b.winAmount.toLocaleString()}</span>
                        ) : (
                          <span className="text-rose-400">-KES {b.amount.toLocaleString()}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeHistoryTab === 'deposits' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800 font-['Outfit']">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {depositsHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500 font-medium">No deposit transactions recorded yet.</td>
                  </tr>
                ) : (
                  depositsHistory.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">{new Date(d.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-bold uppercase font-['Outfit']">{d.method}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">KES {d.amount.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold uppercase font-['Outfit'] text-emerald-400">{d.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeHistoryTab === 'withdrawals' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800 font-['Outfit']">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {withdrawalsHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500 font-medium">No withdrawal requests recorded yet.</td>
                  </tr>
                ) : (
                  withdrawalsHistory.map((w) => (
                    <tr key={w._id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">{new Date(w.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-bold uppercase font-['Outfit']">{w.method}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">KES {w.amount.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold uppercase font-['Outfit'] text-amber-400">{w.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
