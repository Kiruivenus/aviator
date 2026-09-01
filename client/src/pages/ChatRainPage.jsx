import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Info, X, Pin, ChevronDown, Heart, Smile, Send, CloudRain } from 'lucide-react';

export const ChatRainPage = () => {
  const { user, openLogin } = useContext(AuthContext);

  const [messages, setMessages] = useState([
    {
      id: 1,
      user: '2***4',
      time: '14:05:41',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: 'Usindanganywe hapa na watu kujeni niwasaidie saai before kesho 0781457250 need 100 people who are serious wtii'
    },
    {
      id: 2,
      user: '2***0',
      time: '14:05:42',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      text: 'opfu Amenisaidia saai kurudisha yote yenye ilikua imekuliwa 0739558068'
    },
    {
      id: 3,
      user: '2***4',
      time: '14:05:42',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      text: 'vzcp Usindanganywe hapa na watu kujeni niwasaidie saai before kesho whts ap 0786891033 welcome all'
    },
    {
      id: 4,
      user: '2***3',
      time: '14:05:45',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      text: 'Cashed out KES 12,500 at 8.40x multiplier! 🔥🔥🔥'
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [onlineCount, setOnlineCount] = useState(7310);

  // Online count ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount((prev) => prev + (Math.floor(Math.random() * 7) - 3));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    if (!user) return openLogin();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: (user.fullName || 'User').slice(0, 1) + '***' + (user.fullName || 'User').slice(-1),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        text: inputMsg.trim()
      }
    ]);
    setInputMsg('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Full Width Chat Container */}
      <div className="bg-[#141822] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[620px]">
        
        {/* 1. Header Bar */}
        <div className="bg-[#181d27] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer">
            <Info className="w-4 h-4" />
          </div>

          <div className="text-sm font-extrabold text-slate-300 font-['Outfit'] flex items-center gap-1.5">
            <span>Online:</span>
            <span className="text-[#34c759] font-mono text-base font-black">{onlineCount.toLocaleString()}</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Pinned Messages Bar */}
        <div className="bg-[#11141d] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs font-semibold select-none cursor-pointer">
          <div className="flex items-center gap-2 text-slate-300 font-['Outfit']">
            <Pin className="w-4 h-4 text-slate-400" />
            <span>Pinned Messages</span>
            <span className="text-[#ff9500] font-black">(1)</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${pinnedOpen ? 'rotate-180' : ''}`} onClick={() => setPinnedOpen(!pinnedOpen)} />
        </div>

        {/* Pinned Message Content Banner */}
        {pinnedOpen && (
          <div className="bg-[#181a24] border-b border-slate-800/80 px-4 py-2.5 text-xs text-slate-300 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-amber-400 shrink-0" />
            <span>🌧️ System Rain Drop: KES 50 bonuses distributed randomly! Keep chatting to claim.</span>
          </div>
        )}

        {/* 3. Messages Feed */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[440px] no-scrollbar relative">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3 group">
              {/* Profile Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700 shadow-md">
                <img src={m.avatar} alt={m.user} className="w-full h-full object-cover" />
              </div>

              {/* Message Bubble */}
              <div className="flex-1 bg-[#1c222e] border border-slate-800/60 rounded-2xl p-3 space-y-1 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[#34c759] font-black font-mono text-xs">{m.user}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{m.time}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{m.text}</p>
              </div>

              {/* Heart Reaction Icon */}
              <button className="pt-2 text-slate-600 hover:text-rose-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Floating "New messages" Pill Button */}
          <div className="sticky bottom-2 flex justify-center">
            <button className="bg-[#34c759] hover:bg-[#2fb350] text-slate-950 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xl font-['Outfit'] transition-transform active:scale-95">
              <span>New messages</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Bottom Input Bar */}
        <form onSubmit={handleSendMessage} className="bg-[#121620] border-t border-slate-800/80 p-3 space-y-2">
          <input
            type="text"
            placeholder="Your message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
          />

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
            <button type="button" className="text-slate-400 hover:text-slate-200">
              <Smile className="w-5 h-5" />
            </button>

            <span className="text-[10px] text-slate-500 font-mono font-bold">
              AA 160
            </span>

            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-[#1e2533] hover:bg-[#34c759] text-slate-400 hover:text-slate-950 flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
