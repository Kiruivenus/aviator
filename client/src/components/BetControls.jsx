import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import api from '../api/client';

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
      const res = await api.post('/bets/place', {
        amount,
        autoCashout: autoCashoutEnabled ? autoCashout : 0,
      });

      const data = res.data;
      setMyActiveBet(data.bet);
      updateUserBalance(data.newBalance);
      if (onPlaceBetSuccess) onPlaceBetSuccess(data.bet);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
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
    <div className="bg-[#141722] border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xl space-y-2">
      {/* 1. Compact Mode Toggle Header (Bet vs Auto) */}
      <div className="flex justify-center">
        <div className="bg-[#0f1118] p-0.5 rounded-full border border-slate-800/60 inline-flex items-center gap-1">
          <button
            onClick={() => setActiveTab('bet')}
            className={`px-4 py-1 text-[11px] font-extrabold rounded-full transition-all font-['Outfit'] ${
              activeTab === 'bet' ? 'bg-[#282b36] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bet
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-4 py-1 text-[11px] font-extrabold rounded-full transition-all font-['Outfit'] ${
              activeTab === 'auto' ? 'bg-[#282b36] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto
          </button>
        </div>
      </div>

      {/* 2. Main Control Grid: Stepper + 2x2 Presets on left, Compact Green Bet Button on right */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
        {/* Left Inputs Block (7 cols) */}
        <div className="col-span-12 sm:col-span-7 flex flex-col gap-1.5">
          {/* Amount Stepper Pill Container */}
          <div className="bg-[#0c0e15] border border-slate-800 rounded-full px-2 py-1 flex items-center justify-between">
            <button
              onClick={() => adjustAmount(-10)}
              disabled={isBetActive}
              className="w-6 h-6 rounded-full bg-[#1e2330] hover:bg-[#282f40] text-slate-200 font-black text-xs flex items-center justify-center min-w-[24px] transition-colors"
            >
              -
            </button>

            <div className="flex items-center gap-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 10)}
                disabled={isBetActive}
                className="w-16 bg-transparent text-center font-black text-white text-xs sm:text-sm focus:outline-none font-mono"
              />
            </div>

            <button
              onClick={() => adjustAmount(10)}
              disabled={isBetActive}
              className="w-6 h-6 rounded-full bg-[#1e2330] hover:bg-[#282f40] text-slate-200 font-black text-xs flex items-center justify-center min-w-[24px] transition-colors"
            >
              +
            </button>
          </div>

          {/* 2x2 Preset Amount Grid (100, 250, 1,000, 25,000) */}
          <div className="grid grid-cols-2 gap-1.5">
            {[100, 250, 1000, 25000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                disabled={isBetActive}
                className="bg-[#1c202d] hover:bg-[#252a3b] text-slate-200 font-bold text-[11px] py-1 rounded-lg border border-slate-800/80 font-mono transition-all text-center"
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Button Block (5 cols) */}
        <div className="col-span-12 sm:col-span-5 h-full min-h-[64px] flex flex-col">
          {!isBetActive ? (
            <button
              onClick={handlePlaceBet}
              disabled={loading || gameState.status === 'running'}
              className="w-full h-full bg-[#4d7c0f] hover:bg-[#598516] border-2 border-[#659e18]/40 text-white rounded-xl p-2 flex flex-col items-center justify-center font-black shadow-md shadow-green-950/40 transition-transform active:scale-95 min-h-[64px]"
            >
              <span className="text-base sm:text-lg font-black font-['Outfit'] leading-none">
                {gameState.status === 'running' ? 'WAITING' : 'Bet'}
              </span>
              <span className="text-[11px] font-bold font-mono mt-0.5 text-slate-100">
                {gameState.status === 'running' ? 'NEXT ROUND' : `${amount.toFixed(2)} KES`}
              </span>
            </button>
          ) : isRoundRunning ? (
            <button
              onClick={handleCashOut}
              className="w-full h-full bg-[#f59e0b] hover:bg-[#fbbf24] border-2 border-amber-300/40 text-slate-950 rounded-xl p-2 flex flex-col items-center justify-center font-black shadow-md animate-pulse transition-transform active:scale-95 min-h-[64px]"
            >
              <span className="text-sm font-black tracking-wider uppercase font-['Outfit']">CASH OUT</span>
              <span className="text-xs font-black font-mono">{(amount * gameState.multiplier).toFixed(2)} KES</span>
            </button>
          ) : isCashedOut ? (
            <div className="w-full h-full bg-emerald-950/90 border-2 border-emerald-500/50 rounded-xl flex flex-col items-center justify-center p-2 text-center min-h-[64px]">
              <span className="text-xs font-black text-emerald-400 uppercase font-['Outfit']">CASHED OUT!</span>
              <span className="text-xs font-black text-emerald-300 font-mono">+{myActiveBet.winAmount.toFixed(2)} KES</span>
            </div>
          ) : (
            <div className="w-full h-full bg-[#1c202d] border-2 border-emerald-500/60 rounded-xl flex flex-col items-center justify-center p-2 text-center min-h-[64px]">
              <span className="text-xs font-black text-emerald-400 font-['Outfit']">BET ACCEPTED</span>
              <span className="text-[10px] text-slate-300 font-bold font-mono">{amount.toFixed(2)} KES</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Auto Tab Extended Controls */}
      {activeTab === 'auto' && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span>Auto bet</span>
            <button
              type="button"
              onClick={() => setAutoBetEnabled(!autoBetEnabled)}
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoBetEnabled ? 'bg-[#28c700]' : 'bg-slate-800'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoBetEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Auto Cash Out</span>
            <button
              type="button"
              onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoCashoutEnabled ? 'bg-[#28c700]' : 'bg-slate-800'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoCashoutEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>

            <div className="flex items-center bg-[#0c0e15] border border-slate-800 rounded-lg px-1.5 py-0.5 gap-0.5">
              <input
                type="number"
                step="0.05"
                min="1.01"
                value={autoCashout}
                onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 1.01)}
                className="w-10 bg-transparent text-white font-mono font-bold text-[11px] text-center focus:outline-none"
              />
              <span className="text-slate-500 font-mono text-[10px]">x</span>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-1 text-center text-[10px] font-bold text-rose-300 bg-rose-950/80 py-1 px-2 rounded-lg border border-rose-800/60 font-['Outfit']">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export const BetControls = ({ gameState, socket, onPlaceBetSuccess, openChatRain }) => {
  return (
    <div className="w-full bg-[#080b11] border-t border-slate-800/80 p-2 sm:p-3 flex flex-col">
      {/* Twin Bet Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
