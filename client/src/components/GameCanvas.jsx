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

    // Sunburst Rays & Particles
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Radial Sunburst Background Gradient
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, Math.max(width, height));
      bgGradient.addColorStop(0, '#151928');
      bgGradient.addColorStop(0.6, '#0b0e18');
      bgGradient.addColorStop(1, '#070912');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle Sunburst Beams
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      const numRays = 16;
      for (let i = 0; i < numRays; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(width, height), (i * 2 * Math.PI) / numRays, ((i * 2 + 1) * Math.PI) / numRays);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Background Stars
      particles.forEach((p) => {
        p.x -= p.speed;
        if (p.x < 0) p.x = width;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Flight Curve Trajectory
      if (status === 'running' || status === 'crashed') {
        const progress = Math.min(1, (multiplier - 1) / Math.max(3, (crashPoint || 5) - 1));

        const startX = width * 0.08;
        const startY = height * 0.85;
        const endX = startX + width * 0.78 * progress;
        const endY = startY - height * 0.70 * progress;

        const controlX = startX + (endX - startX) * 0.45;
        const controlY = startY;

        // Curved Red/Purple Flight Fill Gradient
        const fillGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        fillGradient.addColorStop(0, 'rgba(180, 20, 60, 0.02)');
        fillGradient.addColorStop(0.7, 'rgba(225, 29, 72, 0.2)');
        fillGradient.addColorStop(1, 'rgba(244, 63, 94, 0.35)');

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
        ctx.fillStyle = fillGradient;
        ctx.fill();

        // Main Flight Trajectory Curve Line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.strokeStyle = status === 'crashed' ? '#ef4444' : '#e11d48';
        ctx.lineWidth = 4;
        ctx.shadowColor = status === 'crashed' ? '#ef4444' : '#e11d48';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Airplane Propeller Sprite
        if (status === 'running') {
          ctx.save();
          ctx.translate(endX, endY);

          const angle = Math.atan2(endY - controlY, endX - controlX);
          ctx.rotate(angle);

          // Body Fuselage
          ctx.fillStyle = '#1e1e24';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;

          // Propeller Blade spin
          const propY = (Date.now() / 20) % 12 - 6;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(16, propY, 2, 12);

          // Airplane Body
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(16, 0);
          ctx.lineTo(-12, -7);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-12, 7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Wings
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(2, -14);
          ctx.lineTo(8, 0);
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
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] bg-[#070912] flex items-center justify-center overflow-hidden select-none">
      {/* HTML5 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Screen Overlay Content */}
      <div className="relative z-10 text-center flex flex-col items-center justify-center px-4">
        {status === 'waiting' && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-200">
            {/* SVG Circular Ring Progress Timer */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#162032"
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
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] font-mono">
              {multiplier.toFixed(2)}
            </h1>
          </div>
        )}

        {status === 'crashed' && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="bg-rose-950/80 border border-rose-600/50 px-6 py-2 rounded-full mb-3 shadow-xl backdrop-blur-md">
              <span className="text-rose-400 font-black text-sm sm:text-base tracking-widest uppercase font-['Outfit']">
                FLEW AWAY!
              </span>
            </div>
            <h1 className="text-6xl sm:text-7xl font-black text-rose-500 tracking-tight font-mono">
              {multiplier.toFixed(2)}
            </h1>
          </div>
        )}
      </div>

      {/* Round ID at bottom right */}
      <div className="absolute bottom-3 right-4 z-10 text-[10px] font-mono font-bold text-slate-500/80 tracking-wider">
        ROUND ID: #452932
      </div>
    </div>
  );
};
