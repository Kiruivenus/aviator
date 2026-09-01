import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { ArrowUpRight, Smartphone, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';

export const WithdrawalPage = () => {
  const { user, updateUserBalance } = useContext(AuthContext);

  const [method, setMethod] = useState('mpesa'); // 'mpesa' or 'usdt'
  const [amount, setAmount] = useState(500);
  const [phone, setPhone] = useState(user?.phone || '');
  const [usdtAddress, setUsdtAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/withdrawal/request', {
        method,
        amount,
        phone: method === 'mpesa' ? phone : undefined,
        usdtAddress: method === 'usdt' ? usdtAddress : undefined
      });

      setMessage({
        type: 'success',
        text: res.data.message || 'Withdrawal submitted! Pending admin approval.'
      });

      if (res.data.newBalance !== undefined) {
        updateUserBalance(res.data.newBalance);
      }

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to submit withdrawal request.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="card-panel p-6 bg-gradient-to-r from-[#1b152b] via-[#161d2d] to-[#0f1422] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-orange-500" />
            WITHDRAW FUNDS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Cash out your winnings directly to your M-Pesa phone number or USDT TRC20 crypto wallet.
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-gray-400 tracking-wider">AVAILABLE BALANCE</div>
          <div className="text-xl font-black text-[#22c55e] font-['Outfit']">
            KES {user?.balance ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>
      </div>

      <div className="card-panel p-6 space-y-6">
        {/* Method Tabs */}
        <div className="flex bg-[#101726] p-1.5 rounded-xl border border-[#1e2a3f]">
          <button
            onClick={() => setMethod('mpesa')}
            className={`flex-1 py-3 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 font-['Outfit'] ${
              method === 'mpesa' ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            M-PESA WITHDRAWAL
          </button>
          <button
            onClick={() => setMethod('usdt')}
            className={`flex-1 py-3 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 font-['Outfit'] ${
              method === 'usdt' ? 'bg-teal-500 text-black shadow-lg shadow-teal-950/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            USDT TRC-20 WITHDRAWAL
          </button>
        </div>

        {/* Feedback Alert */}
        {message.text && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-green-950/80 border-green-800 text-green-300' : 'bg-red-950/80 border-red-800 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-semibold text-sm">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto py-2">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">WITHDRAWAL AMOUNT (KES)</label>
            <input
              type="number"
              required
              min="100"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#172030] border border-[#26354f] rounded-xl px-4 py-3 text-lg font-black text-white font-['Outfit'] focus:outline-none focus:border-orange-500"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Minimum withdrawal: KES 100</span>
          </div>

          {method === 'mpesa' ? (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">RECEIVING M-PESA PHONE NUMBER</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712345678 or 254712345678"
                className="w-full bg-[#172030] border border-[#26354f] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">USDT TRC-20 RECEIVING WALLET ADDRESS</label>
              <input
                type="text"
                required
                placeholder="Enter TRC20 wallet address"
                value={usdtAddress}
                onChange={(e) => setUsdtAddress(e.target.value)}
                className="w-full bg-[#172030] border border-[#26354f] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-black font-extrabold text-base py-3.5 rounded-xl transition-all shadow-lg font-['Outfit'] ${
              method === 'mpesa' ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-950/50' : 'bg-teal-500 hover:bg-teal-400 text-black shadow-teal-950/50'
            }`}
          >
            {loading ? 'SUBMITTING...' : `REQUEST WITHDRAWAL OF KES ${amount.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};
