import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Shield, Users, Wallet, CheckCircle, XCircle, Edit3, Save, RefreshCw, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, pendingDeposits: 0, pendingWithdrawals: 0, totalBetsCount: 0 });
  const [usdtAddress, setUsdtAddress] = useState('');
  const [newUsdtAddress, setNewUsdtAddress] = useState('');

  const [activeTab, setActiveTab] = useState('settings'); // 'settings', 'users', 'transactions'

  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState('user');
  const [editBalance, setEditBalance] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, txRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/transactions')
      ]);

      setStats(statsRes.data.stats);
      setUsdtAddress(statsRes.data.usdtAddress);
      setNewUsdtAddress(statsRes.data.usdtAddress);
      setUsers(usersRes.data.users || []);
      setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update USDT TRC20 Address in MongoDB Settings
  const handleUpdateUSDT = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.put('/admin/settings/usdt', { address: newUsdtAddress });
      setUsdtAddress(res.data.setting.value);
      setMessage('USDT TRC20 Deposit Address updated successfully in database!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update USDT address.');
    }
  };

  // Update User Role & Balance
  const handleSaveUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}`, {
        role: editRole,
        balance: editBalance !== '' ? parseFloat(editBalance) : undefined
      });
      setEditingUserId(null);
      setMessage('User updated successfully!');
      loadDashboardData();
    } catch (err) {
      setMessage('Failed to update user.');
    }
  };

  // Approve / Reject Transaction
  const handleTransactionAction = async (txId, action) => {
    try {
      await api.put(`/admin/transactions/${txId}`, { action });
      setMessage(`Transaction ${action}d successfully!`);
      loadDashboardData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to process transaction action.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="card-panel p-6 bg-gradient-to-r from-purple-950 via-[#181a2e] to-[#0e121d] flex flex-col sm:flex-row items-center justify-between gap-4 border-purple-900/40">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            SYSTEM ADMIN PORTAL
          </h1>
          <p className="text-xs text-purple-300/80 mt-0.5">
            Role-Based Management: Configure USDT TRC20 deposit address, approve transactions & manage users.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/60 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          REFRESH SYSTEM DATA
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 bg-[#141b29] border-[#202d45]">
          <div className="text-[10px] font-bold text-gray-400 uppercase">Total Users</div>
          <div className="text-2xl font-black text-white font-['Outfit'] mt-1">{stats.totalUsers}</div>
        </div>

        <div className="card-panel p-4 bg-[#141b29] border-[#202d45]">
          <div className="text-[10px] font-bold text-yellow-400 uppercase">Pending Deposits</div>
          <div className="text-2xl font-black text-yellow-400 font-['Outfit'] mt-1">{stats.pendingDeposits}</div>
        </div>

        <div className="card-panel p-4 bg-[#141b29] border-[#202d45]">
          <div className="text-[10px] font-bold text-orange-400 uppercase">Pending Withdrawals</div>
          <div className="text-2xl font-black text-orange-400 font-['Outfit'] mt-1">{stats.pendingWithdrawals}</div>
        </div>

        <div className="card-panel p-4 bg-[#141b29] border-[#202d45]">
          <div className="text-[10px] font-bold text-emerald-400 uppercase">Total Game Bets</div>
          <div className="text-2xl font-black text-emerald-400 font-['Outfit'] mt-1">{stats.totalBetsCount}</div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-purple-950/80 border border-purple-800 text-purple-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-purple-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="card-panel p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1c2638]">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-3 font-extrabold text-xs sm:text-sm border-b-2 transition-all font-['Outfit'] ${
              activeTab === 'settings' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            USDT TRC20 DEPOSIT ADDRESS
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3 font-extrabold text-xs sm:text-sm border-b-2 transition-all font-['Outfit'] ${
              activeTab === 'users' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            USER MANAGEMENT ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-5 py-3 font-extrabold text-xs sm:text-sm border-b-2 transition-all font-['Outfit'] ${
              activeTab === 'transactions' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            DEPOSIT & WITHDRAWAL QUEUE ({transactions.length})
          </button>
        </div>

        {/* Tab 1: USDT TRC-20 Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl py-4 space-y-6">
            <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4 text-xs text-purple-300">
              This USDT TRC20 address will be dynamically displayed to all users on the deposit page.
            </div>

            <form onSubmit={handleUpdateUSDT} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  OFFICIAL USDT TRC-20 WALLET ADDRESS
                </label>
                <input
                  type="text"
                  required
                  value={newUsdtAddress}
                  onChange={(e) => setNewUsdtAddress(e.target.value)}
                  placeholder="e.g. T9x2PzQ1K9aM8bC3dE4fG5hJ6kL7mN8pQ9"
                  className="w-full bg-[#172030] border border-[#273754] rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 font-['Outfit']"
              >
                <Save className="w-4 h-4" />
                UPDATE USDT ADDRESS IN DATABASE
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121927] text-gray-400 uppercase font-bold border-b border-[#1c2638]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Balance (KES)</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172030]">
                {users.map((u) => {
                  const isEditing = editingUserId === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-[#141c2c] transition-colors">
                      <td className="p-3 font-bold text-white">{u.fullName}</td>
                      <td className="p-3 font-mono text-gray-300">{u.phone}</td>
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="bg-[#1a2538] border border-[#273857] text-white p-1 rounded font-bold"
                          >
                            <option value="user">USER</option>
                            <option value="admin">ADMIN</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editBalance}
                            onChange={(e) => setEditBalance(e.target.value)}
                            className="w-28 bg-[#1a2538] border border-[#273857] text-white p-1 rounded font-mono"
                          />
                        ) : (
                          `KES ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        )}
                      </td>
                      <td className="p-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveUser(u._id)}
                              className="bg-emerald-600 text-black px-2.5 py-1 rounded font-bold text-[10px]"
                            >
                              SAVE
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="bg-gray-700 text-gray-300 px-2.5 py-1 rounded font-bold text-[10px]"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingUserId(u._id);
                              setEditRole(u.role);
                              setEditBalance(u.balance);
                            }}
                            className="bg-[#1c273c] hover:bg-[#283857] text-gray-200 px-3 py-1 rounded font-bold text-[10px] flex items-center gap-1 ml-auto"
                          >
                            <Edit3 className="w-3 h-3" />
                            EDIT
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Transaction Queue */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121927] text-gray-400 uppercase font-bold border-b border-[#1c2638]">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">User / Phone</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Ref / TxID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172030]">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-[#141c2c] transition-colors">
                    <td className="p-3 font-bold uppercase">
                      {tx.type === 'deposit' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> DEPOSIT
                        </span>
                      ) : (
                        <span className="text-orange-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> WITHDRAWAL
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{tx.userName || 'User'}</div>
                      <div className="text-gray-400 font-mono text-[10px]">{tx.userPhone || tx.phone}</div>
                    </td>
                    <td className="p-3 font-bold uppercase">{tx.method}</td>
                    <td className="p-3 font-mono font-bold text-white">KES {tx.amount.toLocaleString()}</td>
                    <td className="p-3 font-mono text-gray-400 text-[10px] max-w-xs truncate">
                      {tx.txHash || tx.mpesaReceipt || tx.checkoutRequestId || '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        tx.status === 'completed'
                          ? 'bg-green-950 text-green-400 border border-green-800'
                          : tx.status === 'rejected'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-yellow-950 text-yellow-400 border border-yellow-800 animate-pulse'
                      }`}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {tx.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTransactionAction(tx._id, 'approve')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-black px-3 py-1 rounded font-bold text-[10px] flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> APPROVE
                          </button>
                          <button
                            onClick={() => handleTransactionAction(tx._id, 'reject')}
                            className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded font-bold text-[10px] flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> REJECT
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-[10px] font-bold">SETTLED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
