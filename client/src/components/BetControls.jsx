import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const SingleBetPanel = ({ panelId, gameState, socket, onPlaceBetSuccess }) => {
  const { user, openLogin, updateUserBalance } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('bet'); // 'bet' or 'auto'
  const [amount, setAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(1.10);
  const [autoBetEnabled, setAutoBetEnabled] = useState(false);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);

  const [myActiveBet, setMyActiveBet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const adjustAmount = (delta) => {
    setAmount((prev) => Math.max(10, parseFloat((prev + delta).toFixed(0))));
  };

  const handlePlaceBet = async () => {
    if (!user) return openLogin();

    if (user.balance < amount) {
      setErrorMessage('Insufficient balance. Please top up your account.');
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/bets/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aviator_token')}`,
        },
        body: JSON.stringify({
          amount,
          autoCashout: autoCashoutEnabled ? autoCashout : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place bet');

      setMyActiveBet(data.bet);
      updateUserBalance(data.newBalance);
      if (onPlaceBetSuccess) onPlaceBetSuccess(data.bet);
    } catch (err) {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  const handleCashOut = () => {
    if (!myActiveBet || !socket) return;
    socket.emit('cash_out', {
      userId: user.id || user._id,
      betId: myActiveBet.id || myActiveBet._id,
    });
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  useEffect(() => {
    if (gameState.status === 'waiting') setMyActiveBet(null);
  }, [gameState.status]);

  useEffect(() => {
    if (!socket) return;
    const handleCashOutSuccess = (data) => {
      if (myActiveBet && (data.betId === myActiveBet.id || data.userId === (user?.id || user?._id))) {
        setMyActiveBet((prev) => (prev ? { ...prev, status: 'cashed_out', winAmount: data.winAmount } : null));
        if (data.newBalance !== undefined) updateUserBalance(data.newBalance);
      }
    };
    socket.on('cash_out_success', handleCashOutSuccess);
    return () => socket.off('cash_out_success', handleCashOutSuccess);
  }, [socket, myActiveBet, user]);

  const isRoundRunning = gameState.status === 'running';
  const isBetActive = myActiveBet && myActiveBet.status === 'active';
  const isCashedOut = myActiveBet && myActiveBet.status === 'cashed_out';

  return (
    <div className="bg-[#141722] border border-slate-800/80 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl space-y-3">
      {/* 1. Mode Toggle Header (Bet vs Auto) */}
      <div className="flex justify-center">
        <div className="bg-[#0f1118] p-1 rounded-full border border-slate-800/60 inline-flex items-center gap-1">
          <button
            onClick={() => setActiveTab('bet')}
            className={`px-6 py-1.5 text-xs font-black rounded-full transition-all font-['Outfit'] ${
              activeTab === 'bet' ? 'bg-[#282b36] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bet
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-6 py-1.5 text-xs font-black rounded-full transition-all font-['Outfit'] ${
              activeTab === 'auto' ? 'bg-[#282b36] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto
          </button>
        </div>
      </div>

      {/* 2. Main Control Grid: Stepper + 2x2 Presets on left, Green Bet Button on right */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Left Inputs Block (7 cols) */}
        <div className="col-span-12 sm:col-span-7 flex flex-col gap-2.5">
          {/* Amount Stepper Pill Container */}
          <div className="bg-[#0c0e15] border border-slate-800 rounded-full px-3 py-1.5 flex items-center justify-between">
            <button
              onClick={() => adjustAmount(-10)}
              disabled={isBetActive}
              className="w-7 h-7 rounded-full bg-[#1e2330] hover:bg-[#282f40] text-slate-200 font-black text-sm flex items-center justify-center min-w-[28px] transition-colors"
            >
              -
            </button>

            <div className="flex items-center gap-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 10)}
                disabled={isBetActive}
                className="w-20 bg-transparent text-center font-black text-white text-base sm:text-lg focus:outline-none font-mono"
              />
            </div>

            <button
              onClick={() => adjustAmount(10)}
              disabled={isBetActive}
              className="w-7 h-7 rounded-full bg-[#1e2330] hover:bg-[#282f40] text-slate-200 font-black text-sm flex items-center justify-center min-w-[28px] transition-colors"
            >
              +
            </button>
          </div>

          {/* 2x2 Preset Amount Grid (100, 250, 1,000, 25,000) */}
          <div className="grid grid-cols-2 gap-2">
            {[100, 250, 1000, 25000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                disabled={isBetActive}
                className="bg-[#1c202d] hover:bg-[#252a3b] text-slate-200 font-bold text-xs py-2 rounded-xl border border-slate-800/80 font-mono transition-all text-center"
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Button Block (5 cols) */}
        <div className="col-span-12 sm:col-span-5 h-full min-h-[96px] flex flex-col">
          {!isBetActive ? (
            <button
              onClick={handlePlaceBet}
              disabled={loading || gameState.status === 'running'}
              className="w-full h-full bg-[#28c700] hover:bg-[#2edb00] border-2 border-[#3eff12]/40 text-white rounded-2xl p-4 flex flex-col items-center justify-center font-black shadow-lg shadow-green-950/40 transition-transform active:scale-95 min-h-[96px]"
            >
              <span className="text-xl sm:text-2xl font-black font-['Outfit'] leading-none">
                {gameState.status === 'running' ? 'WAITING' : 'Bet'}
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono mt-1 text-slate-100">
                {gameState.status === 'running' ? 'NEXT ROUND' : `${amount.toFixed(2)} KES`}
              </span>
            </button>
          ) : isRoundRunning ? (
            <button
              onClick={handleCashOut}
              className="w-full h-full bg-[#f59e0b] hover:bg-[#fbbf24] border-2 border-amber-300/40 text-slate-950 rounded-2xl p-4 flex flex-col items-center justify-center font-black shadow-lg animate-pulse transition-transform active:scale-95 min-h-[96px]"
            >
              <span className="text-lg font-black tracking-wider uppercase font-['Outfit']">CASH OUT</span>
              <span className="text-base font-black font-mono">{(amount * gameState.multiplier).toFixed(2)} KES</span>
            </button>
          ) : isCashedOut ? (
            <div className="w-full h-full bg-emerald-950/90 border-2 border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center p-3 text-center min-h-[96px]">
              <span className="text-sm font-black text-emerald-400 uppercase font-['Outfit']">CASHED OUT!</span>
              <span className="text-base font-black text-emerald-300 font-mono">+{myActiveBet.winAmount.toFixed(2)} KES</span>
            </div>
          ) : (
            <div className="w-full h-full bg-[#1c202d] border-2 border-emerald-500/60 rounded-2xl flex flex-col items-center justify-center p-3 text-center min-h-[96px]">
              <span className="text-sm font-black text-emerald-400 font-['Outfit']">BET ACCEPTED</span>
              <span className="text-xs text-slate-300 font-bold mt-0.5 font-mono">{amount.toFixed(2)} KES</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Auto Tab Extended Controls */}
      {activeTab === 'auto' && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <span>Auto bet</span>
            <button
              type="button"
              onClick={() => setAutoBetEnabled(!autoBetEnabled)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${autoBetEnabled ? 'bg-[#28c700]' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoBetEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Auto Cash Out</span>
            <button
              type="button"
              onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${autoCashoutEnabled ? 'bg-[#28c700]' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoCashoutEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>

            <div className="flex items-center bg-[#0c0e15] border border-slate-800 rounded-lg px-2 py-1 gap-1">
              <input
                type="number"
                step="0.05"
                min="1.01"
                value={autoCashout}
                onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 1.01)}
                className="w-12 bg-transparent text-white font-mono font-bold text-xs text-center focus:outline-none"
              />
              <span className="text-slate-500 font-mono text-xs">x</span>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 text-center text-xs font-bold text-rose-300 bg-rose-950/80 py-2 px-3 rounded-xl border border-rose-800/60 font-['Outfit']">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export const BetControls = ({ gameState, socket, onPlaceBetSuccess, openChatRain }) => {
  return (
    <div className="w-full bg-[#080b11] border-t border-slate-800/80 p-3 sm:p-5 flex flex-col">
      {/* Twin Bet Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SingleBetPanel
          panelId={1}
          gameState={gameState}
          socket={socket}
          onPlaceBetSuccess={onPlaceBetSuccess}
          openChatRain={openChatRain}
        />
        <SingleBetPanel
          panelId={2}
          gameState={gameState}
          socket={socket}
          onPlaceBetSuccess={onPlaceBetSuccess}
          openChatRain={openChatRain}
        />
      </div>
    </div>
  );
};
