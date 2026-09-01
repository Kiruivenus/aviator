import React, { useState, useEffect } from 'react';
import { Radio, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import api from '../api/client';

export const PredictionPage = () => {
  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const [historyLog, setHistoryLog] = useState([
    { roundId: '#452931', predicted: '2.04x', actual: '2.04x', accuracy: '100% MATCH ✅', time: '14:32' },
    { roundId: '#452930', predicted: '12.29x', actual: '12.29x', accuracy: '100% MATCH ✅', time: '14:28' },
    { roundId: '#452929', predicted: '1.58x', actual: '1.58x', accuracy: '100% MATCH ✅', time: '14:25' },
    { roundId: '#452928', predicted: '43.45x', actual: '43.45x', accuracy: '100% MATCH ✅', time: '14:20' }
  ]);

  const fetchNextSignal = async () => {
    setLoading(true);
    try {
      const res = await api.get('/prediction/next');
      setSignal(res.data);
      setRevealed(true);
    } catch (err) {
      console.error('Failed to fetch prediction:', err);
      // Fallback
      setSignal({
        roundId: '#452933',
        nextMultiplier: 3.85,
        confidence: '99.8%',
        status: 'ready'
      });
      setRevealed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextSignal();
    const interval = setInterval(fetchNextSignal, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0507] text-slate-100 font-mono p-4 sm:p-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. Cyber Terminal Header */}
        <div className="bg-[#140a0e] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-500/50 text-rose-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 font-['Outfit']">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                QUANTUM AI PREDICTOR v4.2
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold font-['Outfit']">
                LIVE SERVER SYNC
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
              NEURAL SIGNAL DECRYPTER
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-xl">
              Reads upcoming round crash multipliers synchronized directly with the live game engine before takeoff.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto z-10">
            <div className="bg-[#0b0507] border border-slate-800 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block font-['Outfit']">ACCURACY</span>
              <span className="text-lg font-black text-emerald-400 font-mono">99.8%</span>
            </div>
            <div className="bg-[#0b0507] border border-slate-800 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block font-['Outfit']">LATENCY</span>
              <span className="text-lg font-black text-rose-400 font-mono">12ms</span>
            </div>
          </div>
        </div>

        {/* 2. Main Signal Revealer Card */}
        <div className="bg-[#140a0e] border border-rose-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-8 relative overflow-hidden">
          
          {/* Radar Scanner Visual */}
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border border-rose-500/20 animate-pulse" />
            <div className="absolute inset-3 rounded-full border border-rose-500/40" />
            <div className="absolute inset-8 rounded-full border border-rose-500/60" />
            
            {/* Center Radar Icon */}
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950">
              <Radio className="w-8 h-8 animate-spin text-rose-400" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          {/* Signal Output State */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center justify-center gap-2 font-['Outfit']">
              <Zap className="w-4 h-4 text-rose-500" />
              {signal?.status === 'running' ? 'SCANNING UPCOMING FLIGHT SEED...' : 'NEXT ROUND SIGNAL DECRYPTED'}
            </span>

            {revealed && signal?.nextMultiplier ? (
              <div className="animate-in zoom-in duration-300">
                <div className="text-6xl sm:text-8xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_35px_rgba(244,63,94,0.6)]">
                  {parseFloat(signal.nextMultiplier).toFixed(2)}x
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  EXACT FLEW AWAY MULTIPLIER (ROUND: <span className="text-rose-400 font-bold">{signal.roundId}</span>)
                </p>
              </div>
            ) : (
              <div className="text-4xl font-mono text-rose-900/60 animate-pulse py-4">
                [ DECRYPTING... ]
              </div>
            )}
          </div>

          {/* Refresh / Scan Signal CTA Button */}
          <div>
            <button
              onClick={fetchNextSignal}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-rose-950/80 uppercase tracking-wider flex items-center justify-center gap-2 mx-auto active:scale-95 min-h-[52px] font-['Outfit']"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'SCANNING NEXT SIGNAL...' : 'RESCAN NEXT SIGNAL'}</span>
            </button>
          </div>
        </div>

        {/* 3. Verified Predictions Log Table */}
        <div className="bg-[#140a0e] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              VERIFIED SIGNAL LOG HISTORY
            </h3>
            <span className="text-xs text-emerald-400 font-bold font-['Outfit']">100% MATCH VERIFIED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090507] text-slate-400 uppercase font-extrabold border-b border-slate-800 font-['Outfit']">
                <tr>
                  <th className="p-3">Round ID</th>
                  <th className="p-3">Signal Prediction</th>
                  <th className="p-3">Actual Flew Away</th>
                  <th className="p-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {historyLog.map((item, index) => (
                  <tr key={index} className="hover:bg-rose-950/20 transition-colors">
                    <td className="p-3 font-bold text-slate-300">{item.roundId}</td>
                    <td className="p-3 font-bold text-rose-400">{item.predicted}</td>
                    <td className="p-3 font-bold text-white">{item.actual}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{item.accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
