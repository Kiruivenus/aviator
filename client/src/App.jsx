import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNavbar } from './components/BottomNavbar';
import { MultiplierHistory } from './components/MultiplierHistory';
import { ActivePlayers } from './components/ActivePlayers';
import { GameCanvas } from './components/GameCanvas';
import { BetControls } from './components/BetControls';
import { AuthModal } from './components/AuthModal';

import { ProfilePage } from './pages/ProfilePage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawalPage } from './pages/WithdrawalPage';
import { ChatRainPage } from './pages/ChatRainPage';
import { PredictionPage } from './pages/PredictionPage';
import { AdminDashboard } from './pages/AdminDashboard';

const MainApp = () => {
  const { user } = useContext(AuthContext);

  const [currentView, setCurrentView] = useState('game'); // 'game', 'deposit', 'withdrawal', 'profile', 'chat', 'prediction', 'admin'
  const [socket, setSocket] = useState(null);

  // Real-time game engine state
  const [gameState, setGameState] = useState({
    roundId: '',
    status: 'waiting', // waiting, running, crashed
    multiplier: 1.0,
    crashPoint: 1.0,
    countdown: 5,
    activeBets: [],
    history: [4.36, 1.08, 6.7, 2.02, 1.93, 4.11, 12.87, 1.42, 1.75, 4.03, 1.66],
  });

  const [myBets, setMyBets] = useState([]);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');
    // Connect socket to Node.js backend
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    // Socket Event Handlers
    newSocket.on('game_state', (data) => {
      setGameState((prev) => ({ ...prev, ...data }));
    });

    newSocket.on('round_waiting', (data) => {
      setGameState((prev) => ({
        ...prev,
        roundId: data.roundId,
        status: 'waiting',
        countdown: data.countdown,
        multiplier: 1.0,
        activeBets: data.activeBets || [],
        history: data.history || prev.history,
      }));
    });

    newSocket.on('countdown_tick', (data) => {
      setGameState((prev) => ({ ...prev, countdown: data.countdown }));
    });

    newSocket.on('round_started', (data) => {
      setGameState((prev) => ({
        ...prev,
        roundId: data.roundId,
        status: 'running',
        crashPoint: data.crashPoint,
        multiplier: 1.0,
      }));
    });

    newSocket.on('multiplier_tick', (data) => {
      setGameState((prev) => ({ ...prev, multiplier: data.multiplier }));
    });

    newSocket.on('bet_placed', (data) => {
      setGameState((prev) => ({
        ...prev,
        activeBets: data.activeBets,
      }));
    });

    newSocket.on('bet_cashed_out', (data) => {
      setGameState((prev) => ({
        ...prev,
        activeBets: prev.activeBets.map((b) =>
          b.id === data.betId || b.userId === data.userId
            ? { ...b, status: 'cashed_out', cashoutMultiplier: data.multiplier, winAmount: data.winAmount }
            : b
        ),
      }));
    });

    newSocket.on('round_crashed', (data) => {
      setGameState((prev) => ({
        ...prev,
        status: 'crashed',
        crashPoint: data.crashPoint,
        multiplier: data.crashPoint,
        history: data.history || [data.crashPoint, ...prev.history],
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handlePlaceBetSuccess = (newBet) => {
    setMyBets((prev) => [newBet, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-['Inter'] select-none overflow-x-clip pb-16 md:pb-0 relative">
      {/* Top Header Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main View Router */}
      {currentView === 'game' && (
        <main className="flex-1 flex flex-col min-h-[calc(100vh-57px)]">
          {/* Top Multiplier History Bar */}
          <MultiplierHistory history={gameState.history} />

          {/* Core Game Body Layout */}
          <div className="flex-1 flex flex-col lg:flex-row bg-[#05070c] items-start">
            
            {/* Desktop-only Left Sidebar (Hidden on mobile) */}
            <div className="hidden lg:block w-80 shrink-0 sticky top-[65px] h-[calc(100vh-75px)] p-2">
              <ActivePlayers activeBets={gameState.activeBets} myBets={myBets} />
            </div>

            {/* Flight Canvas & Twin Bet Controls */}
            <div className="flex-1 flex flex-col w-full h-full bg-[#05070c]">
              {/* HTML5 Canvas Flight Simulation */}
              <div className="relative min-h-[220px] sm:min-h-[270px] flex-1">
                <GameCanvas
                  status={gameState.status}
                  multiplier={gameState.multiplier}
                  countdown={gameState.countdown}
                  crashPoint={gameState.crashPoint}
                />
              </div>

              {/* Twin Bet Control Panels */}
              <BetControls
                gameState={gameState}
                socket={socket}
                onPlaceBetSuccess={handlePlaceBetSuccess}
                openChatRain={() => setCurrentView('chat')}
              />

              {/* Mobile-only Active Players Leaderboard (Positioned directly below betting buttons on smartphone) */}
              <div className="block lg:hidden w-full p-2">
                <ActivePlayers activeBets={gameState.activeBets} myBets={myBets} />
              </div>
            </div>

          </div>
        </main>
      )}

      {currentView === 'deposit' && <DepositPage />}
      {currentView === 'withdrawal' && <WithdrawalPage />}
      {currentView === 'profile' && <ProfilePage setCurrentView={setCurrentView} />}
      {currentView === 'chat' && <ChatRainPage />}
      {currentView === 'prediction' && <PredictionPage />}
      {currentView === 'admin' && (
        user?.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <div className="p-12 text-center text-rose-400 font-extrabold font-['Outfit']">
            Access Restricted: Admin permission required.
          </div>
        )
      )}

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavbar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

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
