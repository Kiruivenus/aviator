import React, { useRef, useEffect } from 'react';

export const GameCanvas = ({ status, multiplier, countdown, crashPoint }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    // Particle system for airplane exhaust / stars
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.5 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep dark space background gradient
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(width, height);

      const bgGradient = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, radius);
      bgGradient.addColorStop(0, '#131126');
      bgGradient.addColorStop(0.6, '#0b0d17');
      bgGradient.addColorStop(1, '#06070a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw subtle background star particles
      particles.forEach((p) => {
        p.x -= p.speed;
        if (p.x < 0) p.x = width;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw flight curve physics when running or crashed
      if (status === 'running' || status === 'crashed') {
        const progress = Math.min(1, (multiplier - 1) / Math.max(3, (crashPoint || 5) - 1));

        const startX = width * 0.08;
        const startY = height * 0.85;
        const endX = startX + width * 0.76 * progress;
        const endY = startY - height * 0.68 * progress;

        const controlX = startX + (endX - startX) * 0.45;
        const controlY = startY;

        // Curved Flight Area Fill Gradient
        const fillGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        fillGradient.addColorStop(0, 'rgba(225, 29, 72, 0.01)');
        fillGradient.addColorStop(0.7, 'rgba(225, 29, 72, 0.18)');
        fillGradient.addColorStop(1, 'rgba(244, 63, 94, 0.35)');

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
        ctx.fillStyle = fillGradient;
        ctx.fill();

        // Main Flight Line Curve
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.strokeStyle = status === 'crashed' ? '#ef4444' : '#f43f5e';
        ctx.lineWidth = 4;
        ctx.shadowColor = status === 'crashed' ? '#ef4444' : '#f43f5e';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset glow shadow

        // Render Animated Jet Plane Sprite at tip
        if (status === 'running') {
          ctx.save();
          ctx.translate(endX, endY);

          // Calculate rotation angle matching curve tangent
          const angle = Math.atan2(endY - controlY, endX - controlX);
          ctx.rotate(angle);

          // Glowing jet thruster trail
          const thrusterGrad = ctx.createLinearGradient(-30, 0, -8, 0);
          thrusterGrad.addColorStop(0, 'rgba(244, 63, 94, 0)');
          thrusterGrad.addColorStop(1, 'rgba(251, 146, 60, 0.9)');
          ctx.fillStyle = thrusterGrad;
          ctx.beginPath();
          ctx.moveTo(-25, 0);
          ctx.lineTo(-8, -4);
          ctx.lineTo(-8, 4);
          ctx.closePath();
          ctx.fill();

          // Main Plane Fuselage Body
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(20, 0);
          ctx.lineTo(-10, -9);
          ctx.lineTo(-4, 0);
          ctx.lineTo(-10, 9);
          ctx.closePath();
          ctx.fill();

          // Plane Wing Highlight
          ctx.fillStyle = '#fecdd3';
          ctx.beginPath();
          ctx.moveTo(4, -15);
          ctx.lineTo(10, 0);
          ctx.lineTo(-2, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [status, multiplier, countdown, crashPoint]);

  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[400px] bg-[#07090e] flex items-center justify-center overflow-hidden select-none">
      {/* Canvas Element */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Screen Overlay Content */}
      <div className="relative z-10 text-center flex flex-col items-center justify-center px-4">
        {status === 'waiting' && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            {/* SVG Circular Ring Progress Timer */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#1a2436"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={263}
                  strokeDashoffset={263 - (263 * (countdown || 0)) / 5}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute text-2xl font-black text-emerald-400 font-['Outfit']">
                {countdown}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs sm:text-sm font-extrabold text-slate-200 tracking-widest font-['Outfit'] uppercase">
                WAITING FOR NEXT ROUND
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Place your bets before flight takeoff</span>
            </div>
          </div>
        )}

        {status === 'running' && (
          <div className="flex flex-col items-center">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] font-['Outfit']">
              {multiplier.toFixed(2)}x
            </h1>
          </div>
        )}

        {status === 'crashed' && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="bg-rose-950/80 border border-rose-600/60 px-6 py-2 rounded-full mb-3 shadow-2xl backdrop-blur-md">
              <span className="text-rose-400 font-black text-sm sm:text-lg tracking-widest uppercase font-['Outfit']">
                FLEW AWAY!
              </span>
            </div>
            <h1 className="text-6xl sm:text-7xl font-black text-rose-500 tracking-tight font-['Outfit'] drop-shadow-[0_10px_20px_rgba(225,29,72,0.4)]">
              {multiplier.toFixed(2)}x
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};
