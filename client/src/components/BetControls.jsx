import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Minus, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const SingleBetPanel = ({ panelId, gameState, socket, onPlaceBetSuccess }) => {
  const { user, openLogin, updateUserBalance } = useContext(AuthContext);

  const [tab, setTab] = useState('Bet'); // 'Bet' or 'Auto'
  const [amount, setAmount] = useState(50.0);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [myActiveBet, setMyActiveBet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Stepper adjustment
  const adjustAmount = (delta) => {
    setAmount((prev) => Math.max(10, parseFloat((prev + delta).toFixed(2))));
  };

  const setQuickAmount = (val) => {
    setAmount(val);
  };

  // Place bet action
  const handlePlaceBet = async () => {
    if (!user) {
      return openLogin();
    }

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
          autoCashout: tab === 'Auto' ? autoCashout : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place bet');
      }

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

  // Cash out action
  const handleCashOut = () => {
    if (!myActiveBet || !socket) return;

    socket.emit('cash_out', {
      userId: user.id || user._id,
      betId: myActiveBet.id || myActiveBet._id,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  // Reset bet on new round waiting state
  useEffect(() => {
    if (gameState.status === 'waiting') {
      setMyActiveBet(null);
    }
  }, [gameState.status]);

  // Handle cashout socket acknowledgement
  useEffect(() => {
    if (!socket) return;

    const handleCashOutSuccess = (data) => {
      if (
        myActiveBet &&
        (data.betId === myActiveBet.id || data.userId === (user?.id || user?._id))
      ) {
        setMyActiveBet((prev) =>
          prev
            ? { ...prev, status: 'cashed_out', winAmount: data.winAmount }
            : null
        );
        if (data.newBalance !== undefined) {
          updateUserBalance(data.newBalance);
        }
      }
    };

    socket.on('cash_out_success', handleCashOutSuccess);
    return () => {
      socket.off('cash_out_success', handleCashOutSuccess);
    };
  }, [socket, myActiveBet, user]);

  const isRoundRunning = gameState.status === 'running';
  const isBetActive = myActiveBet && myActiveBet.status === 'active';
  const isCashedOut = myActiveBet && myActiveBet.status === 'cashed_out';

  return (
    <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-lg">
      {/* Header Tabs: Bet vs Auto */}
      <div className="flex items-center justify-between mb-3">
        <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
          <button
            onClick={() => setTab('Bet')}
            className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all font-['Outfit'] min-h-[36px] ${
              tab === 'Bet'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bet
          </button>
          <button
            onClick={() => setTab('Auto')}
            className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all font-['Outfit'] min-h-[36px] ${
              tab === 'Auto'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auto
          </button>
        </div>

        {tab === 'Auto' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 font-['Outfit']">Auto Cashout:</span>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.1"
                min="1.1"
                value={autoCashout}
                onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 1.1)}
                className="w-16 bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold text-center py-1 rounded-lg focus:outline-none focus:border-emerald-500 font-mono text-xs min-h-[36px]"
              />
              <span className="ml-1 text-slate-400 font-bold text-xs">x</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Steppers & Quick Chips */}
        <div className="col-span-7 flex flex-col gap-2">
          {/* Amount Stepper Control Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center justify-between">
            <button
              onClick={() => adjustAmount(-10)}
              disabled={isBetActive}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-extrabold transition-colors disabled:opacity-40 min-w-[36px] min-h-[36px]"
              aria-label="Decrease bet amount by 10"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400 font-extrabold tracking-wider font-['Outfit']">BET AMOUNT</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={amount}
                  disabled={isBetActive}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-transparent text-center text-white font-black text-sm focus:outline-none font-mono"
                />
                <span className="text-[10px] font-extrabold text-slate-400">KES</span>
              </div>
            </div>

            <button
              onClick={() => adjustAmount(10)}
              disabled={isBetActive}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-extrabold transition-colors disabled:opacity-40 min-w-[36px] min-h-[36px]"
              aria-label="Increase bet amount by 10"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Amount Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[100, 200, 500, 1000].map((val) => (
              <button
                key={val}
                onClick={() => setQuickAmount(val)}
                disabled={isBetActive}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-extrabold text-[11px] py-1.5 rounded-lg border border-slate-800 transition-all font-mono disabled:opacity-40 active:scale-95 min-h-[32px]"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Right Stateful Action Button */}
        <div className="col-span-5 h-full min-h-[80px] flex flex-col">
          {!isBetActive ? (
            <button
              onClick={handlePlaceBet}
              disabled={loading || gameState.status === 'running'}
              className={`w-full h-full rounded-2xl flex flex-col items-center justify-center font-black transition-all shadow-md font-['Outfit'] min-h-[76px] ${
                gameState.status === 'running'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-950/40 active:scale-95'
              }`}
            >
              <span className="text-base sm:text-lg tracking-wider">BET</span>
              <span className="text-xs font-mono font-bold opacity-90">
                {amount.toFixed(2)} KES
              </span>
            </button>
          ) : isRoundRunning ? (
            <button
              onClick={handleCashOut}
              className="w-full h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-2xl flex flex-col items-center justify-center font-black transition-all shadow-lg shadow-orange-950/80 active:scale-95 animate-pulse font-['Outfit'] min-h-[76px]"
            >
              <span className="text-xs sm:text-sm tracking-wider">CASH OUT</span>
              <span className="text-sm sm:text-base font-extrabold font-mono">
                {(amount * gameState.multiplier).toFixed(2)} KES
              </span>
            </button>
          ) : isCashedOut ? (
            <div className="w-full h-full bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center p-2 text-center min-h-[76px]">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase font-['Outfit'] flex items-center gap-1">
                <Check className="w-3 h-3" /> CASHED OUT!
              </span>
              <span className="text-sm font-black text-emerald-300 font-mono">
                +{myActiveBet.winAmount.toFixed(2)} KES
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-2 text-center min-h-[76px]">
              <span className="text-xs font-extrabold text-teal-400 font-['Outfit']">BET ACCEPTED</span>
              <span className="text-[10px] text-slate-400 font-medium">Waiting for flight...</span>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-2 text-center text-[11px] font-bold text-rose-300 bg-rose-950/80 py-1.5 px-3 rounded-xl border border-rose-800/60 font-['Outfit']">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export const BetControls = ({ gameState, socket, onPlaceBetSuccess }) => {
  return (
    <div className="w-full bg-[#080b11] border-t border-slate-800/80 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <SingleBetPanel
        panelId={1}
        gameState={gameState}
        socket={socket}
        onPlaceBetSuccess={onPlaceBetSuccess}
      />
      <SingleBetPanel
        panelId={2}
        gameState={gameState}
        socket={socket}
        onPlaceBetSuccess={onPlaceBetSuccess}
      />
    </div>
  );
};
