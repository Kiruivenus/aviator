import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { User, Wallet, Gift, Smartphone, CheckCircle2, AlertCircle, Plus, Minus } from 'lucide-react';

export const DepositPage = () => {
  const { user, updateUserBalance } = useContext(AuthContext);

  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Format phone number to (254) 7XX-XXXXXX style
  const formatUserPhone = (rawPhone) => {
    if (!rawPhone) return '(254) 700-000000';
    let p = rawPhone.toString().trim().replace(/\D/g, '');
    if (p.startsWith('0')) p = '254' + p.slice(1);
    if (p.length === 12 && p.startsWith('254')) {
      return `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
    }
    return p;
  };

  const handleAdjustAmount = (delta) => {
    setAmount((prev) => Math.max(10, (prev || 0) + delta));
  };

  const handleAddPreset = (val) => {
    setAmount((prev) => (prev || 0) + val);
  };

  const handleMpesaDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const cleanPhone = user?.phone ? user.phone.replace(/\D/g, '') : '254700000000';

    try {
      const res = await api.post('/deposit/mpesa-stk', {
        phone: cleanPhone,
        amount: amount
      });

      setMessage({
        type: 'success',
        text: res.data.message || 'STK Push sent! Please enter your M-Pesa PIN on your mobile phone.'
      });

      if (res.data.newBalance !== undefined) {
        updateUserBalance(res.data.newBalance);
      }

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to initiate M-Pesa deposit.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      {/* 1. Top User Phone Badge */}
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#589b14] text-white flex items-center justify-center shadow-md">
          <User className="w-5 h-5" />
        </div>
        <span className="text-base font-extrabold text-white font-mono tracking-wide">
          {formatUserPhone(user?.phone)}
        </span>
      </div>

      {/* 2. Top Balance & Bonus Summary Card */}
      <div className="bg-[#1c2530] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        {/* Left: Balance */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block font-['Outfit']">Balance</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              KES {user?.balance ? user.balance.toLocaleString() : '0'}
            </span>
          </div>
        </div>

        {/* Right: Bonus */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center">
            <Gift className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block font-['Outfit']">Bonus</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              KES {user?.bonus ? user.bonus.toLocaleString() : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border-rose-800 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* 3. Deposit Main Form Card */}
      <div className="bg-[#1c2530] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-white font-['Outfit']">
            Deposit
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Send money into your MetricWin account
          </p>
        </div>

        <form onSubmit={handleMpesaDeposit} className="space-y-4">
          {/* Stepper Input Container */}
          <div className="bg-[#111720] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleAdjustAmount(-50)}
              className="w-10 h-10 rounded-lg bg-transparent hover:bg-slate-800 text-slate-300 font-black text-xl flex items-center justify-center transition-colors min-w-[40px]"
            >
              -
            </button>

            <input
              type="number"
              required
              min="10"
              placeholder="Enter amount to deposit"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-center font-bold text-white text-base sm:text-lg focus:outline-none placeholder-slate-500 font-mono"
            />

            <button
              type="button"
              onClick={() => handleAdjustAmount(50)}
              className="w-10 h-10 rounded-lg bg-transparent hover:bg-slate-800 text-slate-300 font-black text-xl flex items-center justify-center transition-colors min-w-[40px]"
            >
              +
            </button>
          </div>

          {/* Subtext */}
          <p className="text-[11px] text-slate-400 font-medium text-left">
            Minimum KES 10. All transactions are subject to 5% tax.
          </p>

          {/* Quick Preset Pills (+100, +200, +500, +1000) */}
          <div className="grid grid-cols-4 gap-2.5 pt-1">
            {[100, 200, 500, 1000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAddPreset(val)}
                className="bg-[#273546] hover:bg-[#32445a] text-white font-extrabold text-sm py-2.5 rounded-full transition-all font-mono active:scale-95 shadow-sm"
              >
                +{val}
              </button>
            ))}
          </div>

          {/* Deposit Button: Green M-Pesa Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#517d17] hover:bg-[#5e911b] text-white font-extrabold text-sm sm:text-base py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 font-['Outfit'] active:scale-95 min-h-[48px]"
            >
              <Smartphone className="w-5 h-5 shrink-0" />
              <span>{loading ? 'Processing STK Push...' : 'Deposit with Mpesa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
