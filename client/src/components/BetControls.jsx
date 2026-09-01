import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Minus, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const SingleBetPanel = ({ panelId, gameState, socket, onPlaceBetSuccess, openChatRain }) => {
  const { user, openLogin, updateUserBalance } = useContext(AuthContext);

  const [amount, setAmount] = useState(400);
  const [autoCashout, setAutoCashout] = useState(1.20);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [myActiveBet, setMyActiveBet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const adjustAmount = (delta) => {
    setAmount((prev) => Math.max(10, parseFloat((prev + delta).toFixed(0))));
  };

  const setQuickAmount = (val) => {
    setAmount(val);
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
          autoCashout: autoEnabled ? autoCashout : 0,
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
    <div className="bg-[#0e111b] border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl">
      {/* Main Controls Grid */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Left Inputs Box */}
        <div className="col-span-12 sm:col-span-7 flex flex-col gap-3">
          {/* Stepper Amount Box */}
          <div className="bg-[#080a12] border border-slate-800 rounded-xl p-2 flex items-center justify-between">
            <button
              onClick={() => adjustAmount(-50)}
              disabled={isBetActive}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-black text-lg flex items-center justify-center min-w-[40px]"
            >
              -
            </button>
            <span className="text-lg sm:text-xl font-black text-white font-mono">{amount}</span>
            <button
              onClick={() => adjustAmount(50)}
              disabled={isBetActive}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-black text-lg flex items-center justify-center min-w-[40px]"
            >
              +
            </button>
          </div>

          {/* Quick Preset Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[400, 600, 800, 1000].map((val) => (
              <button
                key={val}
                onClick={() => setQuickAmount(val)}
                disabled={isBetActive}
                className="bg-[#080a12] hover:bg-slate-800 text-slate-300 font-bold text-xs py-2 rounded-xl border border-slate-800 font-mono transition-all min-h-[38px]"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Right Large Action Button Block */}
        <div className="col-span-12 sm:col-span-5 h-full min-h-[88px] flex flex-col">
          {!isBetActive ? (
            <button
              onClick={handlePlaceBet}
              disabled={loading || gameState.status === 'running'}
              className="w-full h-full bg-[#080a12] border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center p-3 transition-all min-h-[88px]"
            >
              <span className="text-sm sm:text-base font-black text-slate-200 tracking-wider font-['Outfit'] uppercase">
                {gameState.status === 'running' ? 'WAITING' : 'BET'}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase font-['Outfit'] mt-0.5">
                {gameState.status === 'running' ? 'NEXT ROUND' : `${amount} KES`}
              </span>
            </button>
          ) : isRoundRunning ? (
            <button
              onClick={handleCashOut}
              className="w-full h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-2xl flex flex-col items-center justify-center font-black transition-all shadow-lg animate-pulse min-h-[88px]"
            >
              <span className="text-sm font-black tracking-wider uppercase font-['Outfit']">CASH OUT</span>
              <span className="text-base font-black font-mono">{(amount * gameState.multiplier).toFixed(2)} KES</span>
            </button>
          ) : isCashedOut ? (
            <div className="w-full h-full bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center p-2 text-center min-h-[88px]">
              <span className="text-xs font-black text-emerald-400 uppercase font-['Outfit']">CASHED OUT!</span>
              <span className="text-base font-black text-emerald-300 font-mono">+{myActiveBet.winAmount.toFixed(2)} KES</span>
            </div>
          ) : (
            <div className="w-full h-full bg-[#080a12] border border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center p-2 text-center min-h-[88px]">
              <span className="text-xs font-black text-emerald-400 font-['Outfit']">BET ACCEPTED</span>
              <span className="text-[10px] text-slate-400 font-medium">Waiting for takeoff...</span>
            </div>
          )}
        </div>
      </div>

      {/* Auto Cash Out Toggle Switch Row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider font-['Outfit']">AUTO CASH OUT</span>
          <button
            type="button"
            onClick={() => setAutoEnabled(!autoEnabled)}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${autoEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            step="0.05"
            min="1.01"
            value={autoCashout}
            onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 1.01)}
            className="w-16 bg-[#080a12] border border-slate-800 text-white font-mono font-bold text-xs text-center py-1.5 rounded-xl focus:outline-none focus:border-slate-600 min-h-[36px]"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 text-center text-xs font-bold text-rose-300 bg-rose-950/80 py-2 px-3 rounded-xl border border-rose-800/60 font-['Outfit']">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export const BetControls = ({ gameState, socket, onPlaceBetSuccess, openChatRain }) => {
  const [controlTab, setControlTab] = useState('stake'); // 'stake' or 'chat'

  return (
    <div className="w-full bg-[#080b11] border-t border-slate-800/80 p-3 sm:p-5 flex flex-col space-y-4">
      {/* Top Segmented Header: STAKE SELECTOR vs AI CHAT SUPPORT */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0e111b] border border-slate-800/80 rounded-2xl max-w-2xl mx-auto w-full">
        <button
          onClick={() => setControlTab('stake')}
          className={`py-3 text-xs font-black rounded-xl transition-all font-['Outfit'] tracking-wider uppercase min-h-[42px] ${
            controlTab === 'stake' ? 'bg-[#161a29] text-white border border-slate-700/60 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          STAKE SELECTOR
        </button>
        <button
          onClick={() => { setControlTab('chat'); if (openChatRain) openChatRain(); }}
          className={`py-3 text-xs font-black rounded-xl transition-all font-['Outfit'] tracking-wider uppercase min-h-[42px] ${
            controlTab === 'chat' ? 'bg-[#161a29] text-cyan-400 border border-cyan-800/60 shadow-md' : 'text-cyan-400/80 hover:text-cyan-300'
          }`}
        >
          AI CHAT SUPPORT
        </button>
      </div>

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
