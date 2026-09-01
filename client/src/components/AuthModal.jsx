import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Phone, Lock, User, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, authTab, setAuthTab, login, register } = useContext(AuthContext);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authTab === 'login') {
        await login(phone, password);
        setSuccess('Logged in successfully!');
        setTimeout(() => setAuthModalOpen(false), 800);
      } else {
        await register(fullName, phone, password);
        setSuccess('Registered successfully! KES 1,000 bonus added.');
        setTimeout(() => setAuthModalOpen(false), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-in fade-in duration-200">
      <div className="modal-content sm:max-w-md w-full relative">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/80 transition-all border border-slate-700/50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Brand Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-pink-600 to-rose-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-900/30">
            M
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-wider font-['Outfit'] leading-none">
              METRIC<span className="text-emerald-400">WIN</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">AUTHENTICATION PORTAL</span>
          </div>
        </div>

        {/* Custom Segmented Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setAuthTab('login'); setError(''); setSuccess(''); }}
            className={`py-2.5 text-xs font-extrabold rounded-lg transition-all font-['Outfit'] ${
              authTab === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LOG IN
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab('register'); setError(''); setSuccess(''); }}
            className={`py-2.5 text-xs font-extrabold rounded-lg transition-all font-['Outfit'] ${
              authTab === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Bonus Promo Highlight for Registration */}
        {authTab === 'register' && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-extrabold text-emerald-300 block font-['Outfit']">WELCOME BONUS</span>
              <span className="text-slate-300 text-[11px]">Get KES 1,000 free bonus upon registration.</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authTab === 'register' && (
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                required
                placeholder="0712345678 or 254712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-950/60 active:scale-[0.99] disabled:opacity-50 font-['Outfit'] tracking-wider uppercase flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{authTab === 'login' ? 'Log In Securely' : 'Complete Registration'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Text */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {authTab === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className="text-emerald-400 font-extrabold hover:underline ml-1 font-['Outfit']"
              >
                Register Now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className="text-emerald-400 font-extrabold hover:underline ml-1 font-['Outfit']"
              >
                Log In Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
