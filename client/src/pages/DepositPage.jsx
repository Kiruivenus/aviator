import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { Wallet, Smartphone, Copy, Check, QrCode, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const DepositPage = () => {
  const { user, updateUserBalance } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('mpesa'); // 'mpesa' or 'usdt'

  // M-Pesa state
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '');
  const [mpesaAmount, setMpesaAmount] = useState(500);

  // USDT state
  const [usdtAddress, setUsdtAddress] = useState('Loading address...');
  const [usdtAmount, setUsdtAmount] = useState(50);
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUSDTAddress();
  }, []);

  const fetchUSDTAddress = async () => {
    try {
      const res = await api.get('/deposit/usdt-address');
      setUsdtAddress(res.data.usdtAddress);
    } catch (err) {
      console.error('Failed to fetch USDT address:', err);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(usdtAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Trigger M-Pesa STK Push
  const handleMpesaDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/deposit/mpesa-stk', {
        phone: mpesaPhone,
        amount: mpesaAmount
      });

      setMessage({
        type: 'success',
        text: res.data.message || 'STK Push notification sent! Check your phone and enter your M-Pesa PIN.'
      });

      if (res.data.newBalance !== undefined) {
        updateUserBalance(res.data.newBalance);
      }

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to initiate M-Pesa STK Push.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit USDT Transaction Hash
  const handleUsdtSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/deposit/usdt-submit', {
        amount: usdtAmount,
        txHash: txHash
      });

      setMessage({
        type: 'success',
        text: res.data.message || 'USDT deposit submitted! Admin will verify and update your balance.'
      });

      setTxHash('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to submit USDT deposit request.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            DEPOSIT FUNDS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Top up your account balance securely via Safaricom M-Pesa or USDT TRC20 Crypto.
          </p>
        </div>

        <div className="text-left sm:text-right bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 w-full sm:w-auto">
          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider font-['Outfit']">CURRENT BALANCE</div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            KES {user?.balance ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('mpesa'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 py-3 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 font-['Outfit'] min-h-[44px] ${
              activeTab === 'mpesa'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            SAFARICOM M-PESA (STK PUSH)
          </button>
          <button
            onClick={() => { setActiveTab('usdt'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 py-3 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 font-['Outfit'] min-h-[44px] ${
              activeTab === 'usdt'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            USDT TRC-20 CRYPTO
          </button>
        </div>

        {/* Feedback Alert */}
        {message.text && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-semibold text-sm">{message.text}</span>
          </div>
        )}

        {/* Tab 1: Safaricom M-Pesa STK Push */}
        {activeTab === 'mpesa' && (
          <form onSubmit={handleMpesaDeposit} className="space-y-6 max-w-xl mx-auto py-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5 font-['Outfit'] uppercase">M-PESA PHONE NUMBER</label>
              <input
                type="tel"
                required
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                placeholder="0712345678 or 254712345678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 min-h-[44px]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                An M-Pesa payment prompt will be displayed directly on your mobile device.
              </span>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5 font-['Outfit'] uppercase">DEPOSIT AMOUNT (KES)</label>
              <input
                type="number"
                required
                min="10"
                value={mpesaAmount}
                onChange={(e) => setMpesaAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-black text-white font-mono focus:outline-none focus:border-emerald-500 min-h-[48px]"
              />

              {/* Quick Amount Pills */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMpesaAmount(amt)}
                    className="bg-slate-950 hover:bg-slate-900 text-slate-300 font-extrabold text-xs py-2 rounded-xl border border-slate-800 transition-all font-mono min-h-[36px]"
                  >
                    KES {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 font-['Outfit'] tracking-wider uppercase min-h-[46px]"
            >
              {loading ? 'SENDING STK PROMPT...' : `TOP UP KES ${mpesaAmount.toLocaleString()} VIA M-PESA`}
            </button>
          </form>
        )}

        {/* Tab 2: USDT TRC-20 Address */}
        {activeTab === 'usdt' && (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                OFFICIAL DEPOSIT ADDRESS (TRC-20)
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-1">USDT TRC20 Wallet Address (Managed by Admin):</div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 font-mono font-bold text-sm text-teal-300 break-all flex items-center justify-between gap-2">
                  <span>{usdtAddress}</span>
                  <button
                    onClick={handleCopyAddress}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 shrink-0 transition-all min-h-[32px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg mx-auto">
                Send only <strong className="text-white">USDT via TRON (TRC-20)</strong> network to this address. Transfers via other chains will result in lost funds.
              </p>
            </div>

            <form onSubmit={handleUsdtSubmit} className="space-y-4">
              <h3 className="text-sm font-extrabold text-white font-['Outfit'] uppercase tracking-wider">
                SUBMIT DEPOSIT VERIFICATION (TxID)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1 font-['Outfit'] uppercase">USDT AMOUNT SENT</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={usdtAmount}
                    onChange={(e) => setUsdtAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-400 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1 font-['Outfit'] uppercase">TRANSACTION HASH (TxID)</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter blockchain TxID"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-400 min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm py-3.5 rounded-xl transition-all shadow-md shadow-teal-950/40 font-['Outfit'] tracking-wider uppercase min-h-[46px]"
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT DEPOSIT FOR ADMIN VERIFICATION'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
