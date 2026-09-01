import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Minus, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

const SingleBetPanel = ({ panelId, gameState, socket, onPlaceBetSuccess }) => {
  const { user, openLogin, updateUserBalance } = useContext(AuthContext);

  const [tab, setTab] = useState('Bet'); // 'Bet' or 'Auto'
  const [amount, setAmount] = useState(50.0);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [myActiveBet, setMyActiveBet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle amount quick changes
  const adjustAmount = (delta) => {
    setAmount(prev => Math.max(10, parseFloat((prev + delta).toFixed(2))));
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
      setErrorMessage('Insufficient balance. Please deposit.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/bets/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('aviator_token')}`
        },
        body: JSON.stringify({
          amount,
          autoCashout: tab === 'Auto' ? autoCashout : 0
        })
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
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cash out action
  const handleCashOut = () => {
    if (!myActiveBet || !socket) return;

    socket.emit('cash_out', {
      userId: user.id || user._id,
      betId: myActiveBet.id || myActiveBet._id
    });

    // Trigger celebration confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // Reset bet state on new round waiting state
  React.useEffect(() => {
    if (gameState.status === 'waiting') {
      setMyActiveBet(null);
    }
  }, [gameState.status]);

  // Listen for websocket cashout acknowledgement
  React.useEffect(() => {
    if (!socket) return;

    const handleCashOutSuccess = (data) => {
      if (myActiveBet && (data.betId === myActiveBet.id || data.userId === (user?.id || user?._id))) {
        setMyActiveBet(prev => prev ? ({ ...prev, status: 'cashed_out', winAmount: data.winAmount }) : null);
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
    <div className="flex-1 bg-[#121824] border border-[#1d273a] rounded-xl p-3 flex flex-col justify-between shadow-lg">
      {/* Header Tabs: Bet / Auto matching screenshot */}
      <div className="flex items-center justify-between mb-3">
        <div className="bg-[#172133] p-0.5 rounded-lg flex border border-[#233149]">
          <button
            onClick={() => setTab('Bet')}
            className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${
              tab === 'Bet' ? 'bg-[#202e47] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Bet
          </button>
          <button
            onClick={() => setTab('Auto')}
            className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${
              tab === 'Auto' ? 'bg-[#202e47] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Auto
          </button>
        </div>

        {tab === 'Auto' && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
            <span>Auto Cashout:</span>
            <input
              type="number"
              step="0.1"
              min="1.1"
              value={autoCashout}
              onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 1.1)}
              className="w-16 bg-[#1a2538] border border-[#263754] text-white font-bold text-center py-0.5 rounded focus:outline-none focus:border-[#22c55e]"
            />
            <span>x</span>
          </div>
        )}
      </div>

      {/* Main Controls Area */}
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Left Inputs: Stepper & Quick amount buttons */}
        <div className="col-span-7 flex flex-col gap-2">
          {/* Stepper control box */}
          <div className="bg-[#172133] border border-[#24334d] rounded-lg p-1.5 flex items-center justify-between">
            <button
              onClick={() => adjustAmount(-10)}
              disabled={isBetActive}
              className="w-8 h-8 rounded bg-[#202e47] hover:bg-[#2a3c5d] text-gray-300 flex items-center justify-center font-extrabold transition-colors disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-bold">BET AMOUNT</span>
              <input
                type="number"
                value={amount}
                disabled={isBetActive}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-20 bg-transparent text-center text-white font-extrabold text-sm focus:outline-none"
              />
            </div>

            <button
              onClick={() => adjustAmount(10)}
              disabled={isBetActive}
              className="w-8 h-8 rounded bg-[#202e47] hover:bg-[#2a3c5d] text-gray-300 flex items-center justify-center font-extrabold transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Amount Pills matching screenshot */}
          <div className="grid grid-cols-4 gap-1">
            {[100, 200, 500, 10000].map((val) => (
              <button
                key={val}
                onClick={() => setQuickAmount(val)}
                disabled={isBetActive}
                className="bg-[#182336] hover:bg-[#23334f] text-gray-300 font-bold text-[11px] py-1 rounded border border-[#233149] transition-all disabled:opacity-50"
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Button: Big Green BET or Big Orange CASH OUT */}
        <div className="col-span-5 h-full min-h-[76px] flex flex-col">
          {!isBetActive ? (
            <button
              onClick={handlePlaceBet}
              disabled={loading || gameState.status === 'running'}
              className={`w-full h-full rounded-xl flex flex-col items-center justify-center font-black transition-all shadow-xl font-['Outfit'] ${
                gameState.status === 'running'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-green-950/60 active:scale-95'
              }`}
            >
              <span className="text-lg tracking-wider">BET</span>
              <span className="text-xs font-bold opacity-90">
                {amount.toFixed(2)} KES
              </span>
            </button>
          ) : isRoundRunning ? (
            <button
              onClick={handleCashOut}
              className="w-full h-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl flex flex-col items-center justify-center font-black transition-all shadow-xl shadow-orange-950/80 active:scale-95 animate-pulse font-['Outfit']"
            >
              <span className="text-sm tracking-wider">CASH OUT</span>
              <span className="text-sm font-extrabold font-mono">
                {(amount * gameState.multiplier).toFixed(2)} KES
              </span>
            </button>
          ) : isCashedOut ? (
            <div className="w-full h-full bg-emerald-950/80 border border-emerald-600/60 rounded-xl flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">CASHED OUT!</span>
              <span className="text-sm font-extrabold text-emerald-300 font-mono">
                +{myActiveBet.winAmount.toFixed(2)} KES
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-[#1b2538] border border-[#283854] rounded-xl flex flex-col items-center justify-center p-2 text-center">
              <span className="text-xs font-bold text-[#38bdf8]">BET ACCEPTED</span>
              <span className="text-[10px] text-gray-400">Waiting for flight...</span>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-2 text-center text-[11px] font-bold text-red-400 bg-red-950/60 py-1 px-2 rounded border border-red-800/40">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export const BetControls = ({ gameState, socket, onPlaceBetSuccess }) => {
  return (
    <div className="w-full bg-[#0d121c] border-t border-[#1b263b] p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
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
