import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Phone, Lock, User, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

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
        setSuccess('Successfully authenticated. Welcome back!');
        setTimeout(() => setAuthModalOpen(false), 800);
      } else {
        await register(fullName, phone, password);
        setSuccess('Account created successfully!');
        setTimeout(() => setAuthModalOpen(false), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Authentication modal">
      <div className="modal-content sm:max-w-md w-full relative p-7 sm:p-9">
        {/* Glow Header Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 transition-all border border-slate-700/50 min-w-[38px] min-h-[38px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Brand Header */}
        <div className="flex items-center gap-3.5 mb-7 pt-1">
          <img 
            src="/aviatorx_logo.jpg" 
            alt="AviatorX" 
            className="w-11 h-11 rounded-2xl object-cover border border-rose-500/40 shadow-lg shadow-rose-950/60" 
          />
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-wider font-['Outfit'] leading-none">
              AVIATOR<span className="text-rose-500 font-black">X</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">AUTHENTICATION PORTAL</span>
          </div>
        </div>

        {/* Custom Segmented Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border border-slate-800/90 rounded-2xl mb-7">
          <button
            type="button"
            onClick={() => { setAuthTab('login'); setError(''); setSuccess(''); }}
            className={`py-3 text-xs font-extrabold rounded-xl transition-all font-['Outfit'] min-h-[44px] ${
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
            className={`py-3 text-xs font-extrabold rounded-lg transition-all font-['Outfit'] min-h-[44px] ${
              authTab === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-2xl text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {authTab === 'register' && (
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-2.5 uppercase tracking-wider font-['Outfit']">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ paddingLeft: '3.25rem', paddingRight: '1rem' }}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium min-h-[50px]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-2.5 uppercase tracking-wider font-['Outfit']">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              <input
                type="tel"
                required
                placeholder="0712345678 or 254712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '3.25rem', paddingRight: '1rem' }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium min-h-[50px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-2.5 uppercase tracking-wider font-['Outfit']">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '3.25rem', paddingRight: '3rem' }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium min-h-[50px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-200 focus:outline-none p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center z-10"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-4 rounded-2xl transition-all shadow-md shadow-emerald-950/50 active:scale-[0.99] disabled:opacity-50 font-['Outfit'] tracking-wider uppercase flex items-center justify-center gap-2 min-h-[50px]"
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

        {/* Footer Navigation */}
        <div className="mt-7 text-center text-xs text-slate-400">
          {authTab === 'login' ? (
            <span>
              Don't have an account?{' '}
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
              Already have an account?{' '}
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
