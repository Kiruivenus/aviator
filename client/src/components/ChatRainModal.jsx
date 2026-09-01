import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, CloudRain, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChatRainModal = ({ isOpen, onClose }) => {
  const { user, openLogin, updateUserBalance } = useContext(AuthContext);

  const [messages, setMessages] = useState([
    { id: 1, user: 'System Bot', text: '🌧️ RAIN DROP EVENT: KES 500 distributed to active players!', time: '12:40 PM', system: true },
    { id: 2, user: 'Patrick K.', text: 'Just cashed out 5.2x! 🔥', time: '12:42 PM' },
    { id: 3, user: 'Alex M.', text: 'Waiting for next flight takeoff 🚀', time: '12:43 PM' },
    { id: 4, user: 'System Bot', text: '🌧️ Next Rain drop in 03:45 minutes!', time: '12:44 PM', system: true }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    if (!user) return openLogin();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: user.fullName || 'Player',
        text: inputMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputMsg('');
  };

  const handleClaimRain = () => {
    if (!user) return openLogin();
    setClaimLoading(true);

    setTimeout(() => {
      setClaimLoading(false);
      setClaimed(true);
      updateUserBalance((user.balance || 0) + 50);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 600);
  };

  return (
    <div className="modal-overlay animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Live Chat and Rain Drop">
      <div className="modal-content sm:max-w-md w-full relative p-6 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <CloudRain className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-2">
                LIVE CHAT & RAIN DROPS
              </h2>
              <span className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase font-mono">RAIN ACTIVE</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/60 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rain Claim Banner Card */}
        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-teal-950/60 border border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold text-cyan-300 font-['Outfit'] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> FREE RAIN BONUS
            </span>
            <p className="text-[11px] text-slate-300">Claim instant KES 50 free bonus credit.</p>
          </div>

          {claimed ? (
            <div className="px-3.5 py-2 bg-emerald-950 border border-emerald-500 text-emerald-400 font-extrabold text-xs rounded-xl flex items-center gap-1 font-['Outfit'] shrink-0">
              <CheckCircle2 className="w-4 h-4" /> CLAIMED!
            </div>
          ) : (
            <button
              onClick={handleClaimRain}
              disabled={claimLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-cyan-950/50 font-['Outfit'] shrink-0 active:scale-95 min-h-[38px]"
            >
              {claimLoading ? 'CLAIMING...' : 'CLAIM KES 50'}
            </button>
          )}
        </div>

        {/* Chat Message Scrollable Container */}
        <div className="h-64 overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl text-xs space-y-1 ${
                m.system ? 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-200' : 'bg-slate-900/90 text-slate-200 border border-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className={`font-extrabold font-['Outfit'] ${m.system ? 'text-cyan-400' : 'text-emerald-400'}`}>
                  {m.user}
                </span>
                <span className="text-slate-500 font-mono">{m.time}</span>
              </div>
              <p className="text-xs leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Send Message Input */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type live message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[40px]"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2.5 rounded-xl font-bold min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
