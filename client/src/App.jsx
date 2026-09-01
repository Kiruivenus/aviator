import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MultiplierHistory } from './components/MultiplierHistory';
import { ActivePlayers } from './components/ActivePlayers';
import { GameCanvas } from './components/GameCanvas';
import { BetControls } from './components/BetControls';
import { AuthModal } from './components/AuthModal';

import { ProfilePage } from './pages/ProfilePage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawalPage } from './pages/WithdrawalPage';
import { AdminDashboard } from './pages/AdminDashboard';

const MainApp = () => {
  const { user } = useContext(AuthContext);

  const [currentView, setCurrentView] = useState('game'); // 'game', 'deposit', 'withdrawal', 'profile', 'admin'
  const [socket, setSocket] = useState(null);

  // Real-time game engine state
  const [gameState, setGameState] = useState({
    roundId: '',
    status: 'waiting', // waiting, running, crashed
    multiplier: 1.00,
    crashPoint: 1.00,
    countdown: 5,
    activeBets: [],
    history: [4.36, 1.08, 6.70, 2.02, 1.93, 4.11, 12.87, 1.42, 1.75, 4.03, 1.66]
  });

  const [myBets, setMyBets] = useState([]);

  useEffect(() => {
    // Connect socket to Node.js backend
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    // Socket Event Handlers
    newSocket.on('game_state', (data) => {
      setGameState(prev => ({ ...prev, ...data }));
    });

    newSocket.on('round_waiting', (data) => {
      setGameState(prev => ({
        ...prev,
        roundId: data.roundId,
        status: 'waiting',
        countdown: data.countdown,
        multiplier: 1.00,
        activeBets: data.activeBets || [],
        history: data.history || prev.history
      }));
    });

    newSocket.on('countdown_tick', (data) => {
      setGameState(prev => ({ ...prev, countdown: data.countdown }));
    });

    newSocket.on('round_started', (data) => {
      setGameState(prev => ({
        ...prev,
        roundId: data.roundId,
        status: 'running',
        crashPoint: data.crashPoint,
        multiplier: 1.00
      }));
    });

    newSocket.on('multiplier_tick', (data) => {
      setGameState(prev => ({ ...prev, multiplier: data.multiplier }));
    });

    newSocket.on('bet_placed', (data) => {
      setGameState(prev => ({
        ...prev,
        activeBets: data.activeBets
      }));
    });

    newSocket.on('bet_cashed_out', (data) => {
      setGameState(prev => ({
        ...prev,
        activeBets: prev.activeBets.map(b => 
          (b.id === data.betId || b.userId === data.userId)
            ? { ...b, status: 'cashed_out', cashoutMultiplier: data.multiplier, winAmount: data.winAmount }
            : b
        )
      }));
    });

    newSocket.on('round_crashed', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'crashed',
        crashPoint: data.crashPoint,
        multiplier: data.crashPoint,
        history: data.history || [data.crashPoint, ...prev.history]
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handlePlaceBetSuccess = (newBet) => {
    setMyBets(prev => [newBet, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col font-['Inter'] select-none">
      {/* Top Header Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main View Router */}
      {currentView === 'game' && (
        <main className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden">
          {/* Top Multiplier History Bar */}
          <MultiplierHistory history={gameState.history} />

          {/* Core Game Body Grid: Left Sidebar + Center Flight Screen */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Active Players Leaderboard Sidebar */}
            <ActivePlayers activeBets={gameState.activeBets} myBets={myBets} />

            {/* Center Canvas Flight View & Twin Bet Control Panels */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090b10]">
              {/* HTML5 Canvas Flight Simulation */}
              <div className="flex-1 relative min-h-[300px]">
                <GameCanvas
                  status={gameState.status}
                  multiplier={gameState.multiplier}
                  countdown={gameState.countdown}
                  crashPoint={gameState.crashPoint}
                />
              </div>

              {/* Bottom Twin Bet Control Panels */}
              <BetControls
                gameState={gameState}
                socket={socket}
                onPlaceBetSuccess={handlePlaceBetSuccess}
              />
            </div>
          </div>
        </main>
      )}

      {currentView === 'deposit' && <DepositPage />}
      {currentView === 'withdrawal' && <WithdrawalPage />}
      {currentView === 'profile' && <ProfilePage setCurrentView={setCurrentView} />}
      {currentView === 'admin' && (
        user?.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <div className="p-8 text-center text-red-400 font-bold">
            Access Restricted: Admin permission required.
          </div>
        )
      )}

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
