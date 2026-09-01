import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Phone, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, authTab, setAuthTab, login, register } = useContext(AuthContext);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
        const res = await login(phone, password);
        setSuccess('Logged in successfully!');
      } else {
        const res = await register(fullName, phone, password);
        setSuccess('Registered successfully! Welcome bonus KES 1,000 added.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-[#192233] hover:bg-[#25324b] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-[#212f47] mb-6">
          <button
            onClick={() => { setAuthTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-center font-bold text-sm font-['Outfit'] border-b-2 transition-all ${
              authTab === 'login'
                ? 'border-[#22c55e] text-[#22c55e]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            LOG IN
          </button>
          <button
            onClick={() => { setAuthTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-center font-bold text-sm font-['Outfit'] border-b-2 transition-all ${
              authTab === 'register'
                ? 'border-[#22c55e] text-[#22c55e]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-950/80 border border-green-800 text-green-300 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#172030] border border-[#26354f] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">PHONE NUMBER</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                required
                placeholder="e.g. 0712345678 or 254712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#172030] border border-[#26354f] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#172030] border border-[#26354f] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-sm py-3 rounded-lg transition-all shadow-lg shadow-green-950/50 mt-2 font-['Outfit']"
          >
            {loading ? 'PROCESSING...' : authTab === 'login' ? 'LOG IN NOW' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Footnote */}
        <div className="mt-4 text-center text-xs text-gray-500">
          {authTab === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className="text-[#22c55e] font-bold hover:underline"
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className="text-[#22c55e] font-bold hover:underline"
              >
                Log in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
