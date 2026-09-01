import React, { useRef, useEffect } from 'react';

export const GameCanvas = ({ status, multiplier, countdown, crashPoint }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background radial pattern matching screenshot
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(width, height);

      const bgGradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, radius);
      bgGradient.addColorStop(0, '#151326');
      bgGradient.addColorStop(0.5, '#0e111a');
      bgGradient.addColorStop(1, '#090b10');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle sunburst rays background effect
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      const rays = 16;
      for (let i = 0; i < rays; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, (i * 2 * Math.PI) / rays, ((i * 2 + 1) * Math.PI) / rays);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // If in running or crashed state, draw the ascending Aviator curve & plane
      if (status === 'running' || status === 'crashed') {
        const progress = Math.min(1, (multiplier - 1) / Math.max(3, (crashPoint || 5) - 1));
        
        const startX = width * 0.08;
        const startY = height * 0.85;
        const endX = startX + (width * 0.75) * progress;
        const endY = startY - (height * 0.65) * progress;

        const controlX = startX + (endX - startX) * 0.4;
        const controlY = startY;

        // Draw Flight Curve Fill Gradient
        const fillGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        fillGradient.addColorStop(0, 'rgba(225, 29, 72, 0.02)');
        fillGradient.addColorStop(0.8, 'rgba(225, 29, 72, 0.25)');
        fillGradient.addColorStop(1, 'rgba(244, 63, 94, 0.4)');

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
        ctx.fillStyle = fillGradient;
        ctx.fill();

        // Draw Main Curved Flight Line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.strokeStyle = status === 'crashed' ? '#ef4444' : '#f43f5e';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Draw Animated Red Aviator Plane Icon at tip
        if (status === 'running') {
          ctx.save();
          ctx.translate(endX, endY);

          // Calculate curve tangent angle
          const angle = Math.atan2(endY - controlY, endX - controlX);
          ctx.rotate(angle);

          // Draw Plane body
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(18, 0);
          ctx.lineTo(-12, -10);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-12, 10);
          ctx.closePath();
          ctx.fill();

          // Plane wing accent
          ctx.fillStyle = '#fda4af';
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
    <div className="relative w-full h-full min-h-[320px] sm:min-h-[420px] bg-[#090b10] flex items-center justify-center overflow-hidden select-none">
      {/* HTML5 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Central Overlay Display matching user screenshot */}
      <div className="relative z-10 text-center flex flex-col items-center justify-center">
        {status === 'waiting' && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin flex items-center justify-center mb-2">
              <span className="text-xl font-extrabold text-[#22c55e] font-['Outfit'] animate-pulse">
                {countdown}
              </span>
            </div>
            <div className="text-sm font-bold text-gray-300 tracking-wider">WAITING FOR NEXT ROUND</div>
            <div className="w-48 h-1.5 bg-[#1a2336] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22c55e] transition-all duration-1000"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {status === 'running' && (
          <div className="flex flex-col items-center">
            {/* Main Bold Multiplier Text (e.g. 1.65x) matching screenshot */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] font-['Outfit']">
              {multiplier.toFixed(2)}x
            </h1>
          </div>
        )}

        {status === 'crashed' && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="bg-red-950/80 border border-red-600/50 px-6 py-2 rounded-full mb-3 shadow-2xl">
              <span className="text-red-400 font-extrabold text-sm sm:text-lg tracking-widest uppercase">
                FLEW AWAY!
              </span>
            </div>
            <h1 className="text-6xl sm:text-7xl font-black text-red-500 tracking-tight font-['Outfit']">
              {multiplier.toFixed(2)}x
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};
