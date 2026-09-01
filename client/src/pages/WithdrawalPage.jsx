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
        text: res.data.message || 'Withdrawal request submitted! Pending admin processing.'
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <ArrowUpRight className="w-7 h-7 text-amber-500 shrink-0" />
            WITHDRAW FUNDS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Cash out your balance directly to your M-Pesa phone number or USDT TRC20 crypto wallet.
          </p>
        </div>

        <div className="text-left sm:text-right bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 w-full sm:w-auto">
          <div className="text-[10px] sm:text-xs font-extrabold text-slate-400 tracking-wider font-['Outfit'] mb-1">AVAILABLE BALANCE</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            KES {user?.balance ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>
      </div>

      <div className="bg-[#101622] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-xl">
        {/* Method Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMethod('mpesa')}
            className={`py-3.5 px-4 font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 font-['Outfit'] min-h-[48px] ${
              method === 'mpesa' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            M-PESA WITHDRAWAL
          </button>
          <button
            onClick={() => setMethod('usdt')}
            className={`py-3.5 px-4 font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 font-['Outfit'] min-h-[48px] ${
              method === 'usdt' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            USDT TRC-20 WITHDRAWAL
          </button>
        </div>

        {/* Feedback Alert */}
        {message.text && (
          <div className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7 max-w-xl mx-auto py-2">
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-200 mb-3 font-['Outfit'] uppercase tracking-wider">
              WITHDRAWAL AMOUNT (KES)
            </label>
            <input
              type="number"
              required
              min="100"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-lg sm:text-xl font-black text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-h-[52px]"
            />
            <span className="text-[11px] sm:text-xs text-slate-400 mt-2 block">Minimum withdrawal amount: KES 100</span>
          </div>

          {method === 'mpesa' ? (
            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-slate-200 mb-3 font-['Outfit'] uppercase tracking-wider">
                RECEIVING M-PESA PHONE NUMBER
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678 or 254712345678"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-h-[50px]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-slate-200 mb-3 font-['Outfit'] uppercase tracking-wider">
                USDT TRC-20 RECEIVING WALLET ADDRESS
              </label>
              <input
                type="text"
                required
                placeholder="Enter TRC20 wallet address"
                value={usdtAddress}
                onChange={(e) => setUsdtAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white font-mono focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all min-h-[50px]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-slate-950 font-black text-sm sm:text-base py-4 rounded-2xl transition-all shadow-md font-['Outfit'] tracking-wider uppercase min-h-[52px] mt-2 ${
              method === 'mpesa' ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-950/40' : 'bg-teal-500 hover:bg-teal-400 shadow-teal-950/40'
            }`}
          >
            {loading ? 'SUBMITTING...' : `REQUEST WITHDRAWAL OF KES ${amount.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};
