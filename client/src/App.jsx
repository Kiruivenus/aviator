import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNavbar } from './components/BottomNavbar';
import { ChatRainModal } from './components/ChatRainModal';
import { MultiplierHistory } from './components/MultiplierHistory';
import { ActivePlayers } from './components/ActivePlayers';
import { GameCanvas } from './components/GameCanvas';
import { BetControls } from './components/BetControls';
import { AuthModal } from './components/AuthModal';

import { ProfilePage } from './pages/ProfilePage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawalPage } from './pages/WithdrawalPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Gamepad2, Users } from 'lucide-react';

const MainApp = () => {
  const { user } = useContext(AuthContext);

  const [currentView, setCurrentView] = useState('game'); // 'game', 'deposit', 'withdrawal', 'profile', 'admin'
  const [mobileTab, setMobileTab] = useState('game'); // 'game' or 'players'
  const [chatRainOpen, setChatRainOpen] = useState(false);
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
    // Connect socket to Node.js backend
    const newSocket = io('http://localhost:5000', {
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
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-['Inter'] select-none overflow-x-hidden pb-16 md:pb-0">
      {/* Top Header Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main View Router */}
      {currentView === 'game' && (
        <main className="flex-1 flex flex-col min-h-[calc(100vh-57px)] overflow-hidden">
          {/* Top Multiplier History Bar */}
          <MultiplierHistory history={gameState.history} />

          {/* Mobile View Switcher Tabs (Game Flight vs Active Players) */}
          <div className="lg:hidden flex bg-[#080b11] border-b border-slate-800 p-1">
            <button
              onClick={() => setMobileTab('game')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 font-['Outfit'] transition-all min-h-[40px] ${
                mobileTab === 'game'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>FLIGHT & BETS</span>
            </button>
            <button
              onClick={() => setMobileTab('players')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 font-['Outfit'] transition-all min-h-[40px] ${
                mobileTab === 'players'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>LIVE BETS ({gameState.activeBets.length > 0 ? gameState.activeBets.length : 2466})</span>
            </button>
          </div>

          {/* Core Game Body Grid: Left Sidebar + Center Flight Screen */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Active Players Sidebar (Shown on desktop OR when mobileTab === 'players') */}
            <div className={`${mobileTab === 'players' ? 'block' : 'hidden'} lg:block w-full lg:w-80 h-full`}>
              <ActivePlayers activeBets={gameState.activeBets} myBets={myBets} />
            </div>

            {/* Center Flight Canvas & Twin Bet Control Panels (Shown on desktop OR when mobileTab === 'game') */}
            <div className={`${mobileTab === 'game' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col h-full overflow-hidden bg-[#05070c]`}>
              {/* HTML5 Canvas Flight Simulation */}
              <div className="flex-1 relative min-h-[280px] sm:min-h-[380px]">
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
          <div className="p-12 text-center text-rose-400 font-extrabold font-['Outfit']">
            Access Restricted: Admin permission required.
          </div>
        )
      )}

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openChatRain={() => setChatRainOpen(true)}
      />

      {/* Live Chat & Rain Drop Modal */}
      <ChatRainModal
        isOpen={chatRainOpen}
        onClose={() => setChatRainOpen(false)}
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
