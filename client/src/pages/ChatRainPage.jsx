import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CloudRain, Send, Sparkles, CheckCircle2, MessageSquare, Users, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChatRainPage = () => {
  const { user, openLogin, updateUserBalance } = useContext(AuthContext);

  const [messages, setMessages] = useState([
    { id: 1, user: 'System Engine', text: '🌧️ RAIN DROP EVENT: KES 1,000 total distributed to active online players!', time: '13:30', system: true },
    { id: 2, user: 'Patrick K.', text: 'Cashed out 5.80x on the last flight! 🔥', time: '13:32' },
    { id: 3, user: 'Alex M.', text: 'Waiting for next flight takeoff 🚀', time: '13:35' },
    { id: 4, user: 'System Engine', text: '⚡ Player Brian claimed KES 50 Rain Drop bonus!', time: '13:38', system: true },
    { id: 5, user: 'Sarah W.', text: 'MetricWin Aviator speed is super smooth today 👏', time: '13:40' }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [countdown, setCountdown] = useState(225); // 03:45 in seconds

  const [rainHistory, setRainHistory] = useState([
    { id: 1, player: 'P***k', amount: 50, time: '13:38' },
    { id: 2, player: 'A***x', amount: 50, time: '13:35' },
    { id: 3, player: 'S***h', amount: 50, time: '13:30' },
    { id: 4, player: 'D***o', amount: 50, time: '13:25' }
  ]);

  // Rain countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

      setRainHistory((prev) => [
        { id: Date.now(), player: (user.fullName || 'Player').slice(0, 1) + '***' + (user.fullName || 'Player').slice(-1), amount: 50, time: 'Just now' },
        ...prev
      ]);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-[#101520] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
              <CloudRain className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              COMMUNITY CHAT & RAIN DROPS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-2xl">
            Connect in real-time with fellow players and claim free KES Rain Drop bonuses distributed automatically in the chat feed!
          </p>
        </div>

        {/* Live Metrics Pills */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="bg-[#090b10] border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase font-['Outfit'] block">ONLINE</span>
            <span className="text-base font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5" /> 2,468
            </span>
          </div>

          <div className="bg-[#090b10] border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase font-['Outfit'] block">NEXT RAIN</span>
            <span className="text-base font-black text-cyan-400 font-mono flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatCountdown(countdown)}
            </span>
          </div>

          <div className="bg-[#090b10] border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase font-['Outfit'] block">TOTAL RAIN</span>
            <span className="text-base font-black text-purple-400 font-mono flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> 125K+
            </span>
          </div>
        </div>
      </div>

      {/* 2. Active Rain Bonus Feature Banner */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-[#101520] to-teal-950/80 border border-cyan-500/40 rounded-2xl sm:rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-cyan-300 font-['Outfit'] tracking-wider uppercase">
                ACTIVE RAIN DROP EVENT
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase">
                FREE BONUS
              </span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              Claim KES 50 free credit added instantly to your wallet balance.
            </p>
          </div>
        </div>

        {claimed ? (
          <div className="px-6 py-3.5 bg-emerald-950 border border-emerald-500 text-emerald-300 font-black text-sm rounded-2xl flex items-center gap-2 font-['Outfit'] shrink-0 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>KES 50 CLAIMED!</span>
          </div>
        ) : (
          <button
            onClick={handleClaimRain}
            disabled={claimLoading}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-lg shadow-cyan-950/50 font-['Outfit'] tracking-wider uppercase shrink-0 active:scale-95 min-h-[48px]"
          >
            {claimLoading ? 'CLAIMING BONUS...' : 'CLAIM KES 50 RAIN BONUS'}
          </button>
        )}
      </div>

      {/* 3. Main Content Grid (Left Chat Feed + Right Rain Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Live Chat Feed */}
        <div className="lg:col-span-7 bg-[#101520] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl min-h-[500px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-extrabold text-white font-['Outfit']">
                LIVE COMMUNITY CHAT
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">{messages.length} Messages</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 space-y-3 max-h-[380px] overflow-y-auto pr-2 no-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl text-xs space-y-1 transition-all ${
                  m.system
                    ? 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-200'
                    : 'bg-[#090b10] border border-slate-800/80 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-black font-['Outfit'] text-xs ${m.system ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {m.user}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{m.time}</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">{m.text}</p>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2.5 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Type message to community..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-[#090b10] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[46px]"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs min-h-[46px] flex items-center justify-center gap-2 font-['Outfit'] uppercase transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">SEND</span>
            </button>
          </form>
        </div>

        {/* Right 5 Columns: Rain Drop History & Rules */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rain Claims History Table */}
          <div className="bg-[#101520] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                RECENT RAIN CLAIMS
              </h3>
              <span className="text-xs font-mono text-purple-400 font-bold">KES 50 / claim</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090b10] text-slate-400 uppercase font-extrabold border-b border-slate-800 font-['Outfit']">
                  <tr>
                    <th className="p-2.5">Player</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {rainHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/60">
                      <td className="p-2.5 font-mono font-bold text-white">{item.player}</td>
                      <td className="p-2.5 font-mono font-bold text-cyan-400">+KES {item.amount}</td>
                      <td className="p-2.5 text-right font-mono text-slate-400">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rain Rules Info Box */}
          <div className="bg-[#101520] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 space-y-3 text-xs text-slate-400 leading-relaxed shadow-xl">
            <h4 className="text-sm font-extrabold text-white font-['Outfit'] uppercase tracking-wider">
              HOW RAIN DROPS WORK
            </h4>
            <ul className="space-y-2 list-disc list-inside text-slate-300">
              <li>Rain drops are free balance rewards randomly released in the chat feed.</li>
              <li>Active players online can click <strong className="text-cyan-300">CLAIM</strong> to receive instant credit.</li>
              <li>Bonus funds are automatically credited to your main balance for gameplay or cashout.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
