import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { User, Phone, Shield, Wallet, History, ArrowDownLeft, ArrowUpRight, Save, CheckCircle } from 'lucide-react';

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
      setMessage('Profile updated successfully!');
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
      <div className="p-8 text-center text-gray-400">
        Please log in to view your profile management portal.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner Card */}
      <div className="card-panel p-6 bg-gradient-to-r from-[#131a29] via-[#1a2336] to-[#121824] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-700 border-2 border-emerald-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
              {user.fullName}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                user.role === 'admin' ? 'bg-purple-900/80 text-purple-300 border border-purple-700' : 'bg-blue-900/80 text-blue-300 border border-blue-700'
              }`}>
                {user.role}
              </span>
            </h1>
            <p className="text-sm text-gray-400 font-mono mt-0.5">{user.phone}</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-[#0b0f17] border border-[#1f2b3e] rounded-xl px-6 py-4 flex items-center gap-6 shadow-inner">
          <div>
            <div className="text-xs font-bold text-gray-400 tracking-wider">AVAILABLE BALANCE</div>
            <div className="text-2xl font-black text-[#22c55e] font-['Outfit']">
              KES {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setCurrentView('deposit')}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-xs px-4 py-1.5 rounded-lg transition-all"
            >
              DEPOSIT
            </button>
            <button
              onClick={() => setCurrentView('withdrawal')}
              className="bg-[#1b2538] hover:bg-[#26354f] text-gray-200 font-extrabold text-xs px-4 py-1.5 rounded-lg border border-[#273752] transition-all"
            >
              WITHDRAW
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Edit Profile & History Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Update Details */}
        <div className="lg:col-span-5 card-panel p-6 space-y-6">
          <h2 className="text-lg font-extrabold text-white font-['Outfit'] flex items-center gap-2 border-b border-[#1c2638] pb-3">
            <User className="w-5 h-5 text-[#22c55e]" />
            ACCOUNT DETAILS
          </h2>

          {message && (
            <div className="p-3 bg-green-950/80 border border-green-800 text-green-300 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#172030] border border-[#26354f] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">REGISTERED PHONE (LOCKED)</label>
              <input
                type="text"
                disabled
                value={user.phone}
                className="w-full bg-[#0f1522] border border-[#1d273a] rounded-lg px-3.5 py-2.5 text-sm text-gray-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">NEW PASSWORD (OPTIONAL)</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#172030] border border-[#26354f] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-sm py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-['Outfit'] shadow-md"
            >
              <Save className="w-4 h-4" />
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </form>
        </div>

        {/* Right Column: History Log Tabs */}
        <div className="lg:col-span-7 card-panel p-6 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[#1c2638] mb-4">
            <button
              onClick={() => setActiveTab('bets')}
              className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all font-['Outfit'] ${
                activeTab === 'bets' ? 'border-[#22c55e] text-[#22c55e]' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              BET HISTORY ({bets.length})
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all font-['Outfit'] ${
                activeTab === 'deposits' ? 'border-[#22c55e] text-[#22c55e]' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              DEPOSITS ({deposits.length})
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all font-['Outfit'] ${
                activeTab === 'withdrawals' ? 'border-[#22c55e] text-[#22c55e]' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              WITHDRAWALS ({withdrawals.length})
            </button>
          </div>

          {/* History Content */}
          <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-[#172030] text-xs">
            {activeTab === 'bets' && (
              bets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No bets placed yet.</div>
              ) : (
                bets.map((b) => (
                  <div key={b._id} className="py-3 px-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Round: {b.roundId}</div>
                      <div className="text-[10px] text-gray-400">{new Date(b.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-gray-300">Bet: KES {b.amount.toFixed(2)}</div>
                      {b.status === 'cashed_out' ? (
                        <div className="font-bold text-green-400">
                          Won KES {b.winAmount.toFixed(2)} ({b.cashoutMultiplier.toFixed(2)}x)
                        </div>
                      ) : (
                        <div className="font-semibold text-red-400">Lost</div>
                      )}
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'deposits' && (
              deposits.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No deposits recorded.</div>
              ) : (
                deposits.map((d) => (
                  <div key={d._id} className="py-3 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="font-bold text-white uppercase">{d.method} DEPOSIT</div>
                        <div className="text-[10px] text-gray-400">{new Date(d.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-green-400">+ KES {d.amount.toFixed(2)}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'completed' ? 'bg-green-950 text-green-400' : 'bg-yellow-950 text-yellow-400'
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
                <div className="p-8 text-center text-gray-500">No withdrawal history.</div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w._id} className="py-3 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="font-bold text-white uppercase">{w.method} WITHDRAWAL</div>
                        <div className="text-[10px] text-gray-400">{new Date(w.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-orange-400">- KES {w.amount.toFixed(2)}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.status === 'completed' ? 'bg-green-950 text-green-400' : w.status === 'rejected' ? 'bg-red-950 text-red-400' : 'bg-yellow-950 text-yellow-400'
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
