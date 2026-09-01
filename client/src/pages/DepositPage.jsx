import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { Wallet, Smartphone, Copy, Check, QrCode, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const DepositPage = () => {
  const { user, updateUserBalance } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('mpesa'); // 'mpesa' or 'usdt'

  // M-Pesa state
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '');
  const [mpesaAmount, setMpesaAmount] = useState(500);

  // USDT state
  const [usdtAddress, setUsdtAddress] = useState('Loading...');
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
        text: res.data.message || 'STK Push sent to your phone! Please enter your M-Pesa PIN.'
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
        text: res.data.message || 'USDT deposit submitted! Admin will verify and credit your balance.'
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Title Banner */}
      <div className="card-panel p-6 bg-gradient-to-r from-[#131b2a] to-[#0d131f] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#22c55e]" />
            DEPOSIT FUNDS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Top up your account balance securely via Safaricom M-Pesa or USDT TRC20 Crypto.
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-gray-400 tracking-wider">CURRENT BALANCE</div>
          <div className="text-xl font-black text-[#22c55e] font-['Outfit']">
            KES {user?.balance ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-panel p-6 space-y-6">
        <div className="flex bg-[#101726] p-1.5 rounded-xl border border-[#1e2a3f]">
          <button
            onClick={() => { setActiveTab('mpesa'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 py-3 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 font-['Outfit'] ${
              activeTab === 'mpesa'
                ? 'bg-[#22c55e] text-black shadow-lg shadow-green-950/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            SAFARICOM M-PESA (STK PUSH)
          </button>
          <button
            onClick={() => { setActiveTab('usdt'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 py-3 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 font-['Outfit'] ${
              activeTab === 'usdt'
                ? 'bg-teal-500 text-black shadow-lg shadow-teal-950/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            USDT TRC-20 CRYPTO
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

        {/* Tab 1: Safaricom M-Pesa STK Push */}
        {activeTab === 'mpesa' && (
          <form onSubmit={handleMpesaDeposit} className="space-y-6 max-w-xl mx-auto py-2">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">M-PESA PHONE NUMBER</label>
              <input
                type="tel"
                required
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                placeholder="e.g. 0712345678 or 254712345678"
                className="w-full bg-[#172030] border border-[#26354f] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#22c55e]"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                The STK prompt will be sent directly to this phone number.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">DEPOSIT AMOUNT (KES)</label>
              <input
                type="number"
                required
                min="10"
                value={mpesaAmount}
                onChange={(e) => setMpesaAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#172030] border border-[#26354f] rounded-xl px-4 py-3 text-lg font-black text-white font-['Outfit'] focus:outline-none focus:border-[#22c55e]"
              />

              {/* Quick Amount Selector Pills */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMpesaAmount(amt)}
                    className="bg-[#192437] hover:bg-[#253552] text-gray-300 font-bold text-xs py-2 rounded-lg border border-[#283957] transition-all"
                  >
                    KES {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-base py-3.5 rounded-xl transition-all shadow-lg shadow-green-950/50 flex items-center justify-center gap-2 font-['Outfit']"
            >
              {loading ? 'SENDING STK PROMPT...' : `TOP UP KES ${mpesaAmount.toLocaleString()} VIA M-PESA`}
            </button>
          </form>
        )}

        {/* Tab 2: USDT TRC-20 Address managed by Admin */}
        {activeTab === 'usdt' && (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            {/* USDT Deposit Address Display Box */}
            <div className="bg-[#0f1624] border border-[#212e47] rounded-2xl p-6 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                OFFICIAL DEPOSIT ADDRESS (TRC-20)
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">USDT TRC20 Wallet Address (Managed by Admin):</div>
                <div className="bg-[#162033] border border-[#273857] rounded-xl px-4 py-3 font-mono font-bold text-sm text-teal-300 break-all select-all flex items-center justify-between gap-2">
                  <span>{usdtAddress}</span>
                  <button
                    onClick={handleCopyAddress}
                    className="bg-teal-500 hover:bg-teal-400 text-black px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 shrink-0 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed max-w-lg mx-auto">
                Send only <strong className="text-white">USDT via the TRON (TRC-20) network</strong> to this address. Transfers via other chains (ERC-20, BEP-20) will result in permanent loss.
              </p>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleUsdtSubmit} className="space-y-4">
              <h3 className="text-sm font-extrabold text-white font-['Outfit']">
                SUBMIT DEPOSIT VERIFICATION (TxID)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">USDT AMOUNT SENT</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={usdtAmount}
                    onChange={(e) => setUsdtAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#172030] border border-[#26354f] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">TRANSACTION HASH (TxID)</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter blockchain TxID / hash"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-[#172030] border border-[#26354f] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-sm py-3 rounded-xl transition-all shadow-lg shadow-teal-950/50 font-['Outfit']"
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
