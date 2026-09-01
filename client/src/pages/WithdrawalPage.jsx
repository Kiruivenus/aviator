import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const WithdrawalPage = () => {
  const { user, updateUserBalance } = useContext(AuthContext);

  const [amount, setAmount] = useState(2000);
  const [phone, setPhone] = useState(user?.phone?.replace(/^254/, '') || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const fullPhone = '254' + phone.replace(/\D/g, '');

    try {
      const res = await api.post('/withdrawal/request', {
        method: 'mpesa',
        amount,
        phone: fullPhone
      });

      setMessage({
        type: 'success',
        text: res.data.message || 'Payout request submitted successfully! Processing is automated.'
      });

      if (res.data.newBalance !== undefined) {
        updateUserBalance(res.data.newBalance);
      }

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to submit payout request.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-6">
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
          Request Withdrawal
        </h1>

        {/* Feedback Alert */}
        {message.text && (
          <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Field with KES Prefix */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-2 uppercase tracking-wider font-['Outfit']">
              AMOUNT (KES)
            </label>
            <div className="flex items-center bg-[#0e111b] border border-slate-800 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors">
              <div className="px-4 py-3.5 bg-slate-900 border-r border-slate-800 font-extrabold text-slate-300 text-sm font-mono shrink-0">
                KES
              </div>
              <input
                type="number"
                required
                min="100"
                placeholder="e.g. 2000"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent px-4 py-3.5 text-sm sm:text-base font-bold text-white placeholder-slate-600 focus:outline-none font-mono min-h-[50px]"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block font-medium">
              Min limit is KES 2000. Processing is automated.
            </span>
          </div>

          {/* M-Pesa Phone Number Field with +254 Prefix */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-2 uppercase tracking-wider font-['Outfit']">
              M-PESA NUMBER
            </label>
            <div className="flex items-center bg-[#0e111b] border border-slate-800 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors">
              <div className="px-4 py-3.5 bg-slate-900 border-r border-slate-800 font-extrabold text-purple-400 text-sm font-mono shrink-0">
                +254
              </div>
              <input
                type="tel"
                required
                placeholder="7XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent px-4 py-3.5 text-sm sm:text-base font-bold text-white placeholder-slate-600 focus:outline-none font-mono min-h-[50px]"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm sm:text-base py-4 rounded-xl transition-all shadow-lg shadow-purple-950/60 font-['Outfit'] tracking-wider min-h-[52px] mt-2 active:scale-95"
          >
            {loading ? 'Processing...' : 'Submit Payout Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
