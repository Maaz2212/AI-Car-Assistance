'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eye, Zap, Flame, Shield, Layers, Compass } from 'lucide-react';

interface Spline3DCarViewerProps {
  onSelectVehicle?: (modelName: string) => void;
}

export const Spline3DCarViewer: React.FC<Spline3DCarViewerProps> = ({ onSelectVehicle }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeMode, setActiveMode] = useState<'3d' | 'underglow' | 'xray'>('underglow');
  const [rotationAngle, setRotationAngle] = useState<number>(25);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>('underglow');

  // Animation frame loop refs
  const angleRef = useRef<number>(25);
  const modeRef = useRef<'3d' | 'underglow' | 'xray'>('underglow');
  const isVisibleRef = useRef<boolean>(true);
  modeRef.current = activeMode;

  useEffect(() => {
    // Observer to pause animation loop when scrolled out of view (Performance Fix)
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Optimized particle count for 60fps performance
    const particles: { x: number; y: number; size: number; speed: number; opacity: number }[] = Array.from(
      { length: 25 },
      () => ({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 500),
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.6 + 0.2,
        opacity: Math.random() * 0.6 + 0.2,
      })
    );

    const render = () => {
      // Pause loop if viewer is scrolled offscreen (Performance optimization)
      if (!isVisibleRef.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Dark Studio Radial Background
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.2
      );
      bgGrad.addColorStop(0, '#151A2E');
      bgGrad.addColorStop(0.5, '#0E111D');
      bgGrad.addColorStop(1, '#07080B');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 20;
      const rad = (angleRef.current * Math.PI) / 180;

      // 2. Cyan & Amber Floor Pedestal
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 80, width * 0.38, height * 0.14, 0, 0, Math.PI * 2);
      
      if (modeRef.current === 'underglow') {
        const floorGrad = ctx.createRadialGradient(centerX, centerY + 80, 10, centerX, centerY + 80, width * 0.38);
        floorGrad.addColorStop(0, 'rgba(51, 214, 166, 0.4)');
        floorGrad.addColorStop(0.4, 'rgba(0, 242, 254, 0.2)');
        floorGrad.addColorStop(0.8, 'rgba(255, 176, 32, 0.05)');
        floorGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = floorGrad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(51, 214, 166, 0.12)';
        ctx.lineWidth = 1;
        for (let r = 40; r < width * 0.38; r += 45) {
          ctx.beginPath();
          ctx.ellipse(centerX, centerY + 80, r, r * 0.35, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (modeRef.current === 'xray') {
        ctx.strokeStyle = 'rgba(255, 176, 32, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // 3. Underglow Particles
      if (modeRef.current === 'underglow') {
        particles.forEach((p) => {
          p.y -= p.speed;
          if (p.y < centerY - 80) {
            p.y = centerY + 120;
            p.x = centerX + (Math.random() - 0.5) * (width * 0.6);
          }
          ctx.fillStyle = `rgba(51, 214, 166, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. 3D Car Wireframe / Mesh
      ctx.save();
      ctx.translate(centerX, centerY);

      const scale = Math.min(width, height) / 600;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      const carNodes = [
        { x: -160 * cosA, y: -20, z: 80 * sinA },
        { x: -140 * cosA, y: -35, z: 70 * sinA },
        { x: -80 * cosA, y: -55, z: 60 * sinA },
        { x: -20 * cosA, y: -95, z: 50 * sinA },
        { x: 60 * cosA, y: -95, z: 45 * sinA },
        { x: 130 * cosA, y: -50, z: 55 * sinA },
        { x: 170 * cosA, y: -25, z: 65 * sinA },
        { x: 160 * cosA, y: 30, z: 70 * sinA },
        { x: -150 * cosA, y: 30, z: 80 * sinA },
      ];

      ctx.lineWidth = modeRef.current === 'xray' ? 2 : 2.5;
      
      if (modeRef.current === 'xray') {
        ctx.strokeStyle = '#FFB020';
      } else {
        const bodyGrad = ctx.createLinearGradient(-150 * scale, 0, 150 * scale, 0);
        bodyGrad.addColorStop(0, '#33D6A6');
        bodyGrad.addColorStop(0.5, '#F4F3EF');
        bodyGrad.addColorStop(1, '#FFB020');
        ctx.strokeStyle = bodyGrad;
      }

      ctx.beginPath();
      carNodes.forEach((node, idx) => {
        const px = node.x * scale;
        const py = node.y * scale;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.stroke();

      // Interior Roof & Pillars
      ctx.beginPath();
      ctx.strokeStyle = modeRef.current === 'xray' ? 'rgba(51, 214, 166, 0.7)' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.moveTo(-80 * scale * cosA, -55 * scale);
      ctx.lineTo(-20 * scale * cosA, -95 * scale);
      ctx.moveTo(60 * scale * cosA, -95 * scale);
      ctx.lineTo(130 * scale * cosA, -50 * scale);
      ctx.moveTo(-140 * scale * cosA, -35 * scale);
      ctx.lineTo(170 * scale * cosA, -25 * scale);
      ctx.stroke();

      // Wheels
      const wheelPos = [
        { x: -100 * cosA, y: 30 },
        { x: 100 * cosA, y: 30 },
      ];

      wheelPos.forEach((w) => {
        const wx = w.x * scale;
        const wy = w.y * scale;
        
        ctx.beginPath();
        ctx.arc(wx, wy, 28 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#0E111D';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = modeRef.current === 'underglow' ? '#33D6A6' : '#FFB020';
        ctx.stroke();

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + Math.cos(a + rad) * 22 * scale, wy + Math.sin(a + rad) * 22 * scale);
          ctx.stroke();
        }
      });

      // Headlight Beam
      ctx.beginPath();
      const hx = -160 * scale * cosA;
      const hy = -20 * scale;
      const headGrad = ctx.createRadialGradient(hx, hy, 2, hx - 80 * scale, hy + 20, 100 * scale);
      headGrad.addColorStop(0, 'rgba(0, 242, 254, 0.8)');
      headGrad.addColorStop(0.5, 'rgba(51, 214, 166, 0.3)');
      headGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = headGrad;
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - 120 * scale, hy - 40 * scale);
      ctx.lineTo(hx - 140 * scale, hy + 60 * scale);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Smooth rotation
      angleRef.current = (angleRef.current + 0.25) % 360;
      setRotationAngle(Math.round(angleRef.current));

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    angleRef.current = (angleRef.current + deltaX * 0.5) % 360;
    setDragStartX(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div ref={containerRef} className="relative w-full h-[520px] rounded-3xl glass-panel overflow-hidden border border-white/10 shadow-2xl group select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
        <div className="bg-black/70 backdrop-blur-md border border-showroom-teal/40 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-teal-glow">
          <div className="w-2.5 h-2.5 rounded-full bg-showroom-teal animate-ping" />
          <span className="font-mono text-xs font-bold text-showroom-ink">
            SPLINE 3D VIEWPORT • {rotationAngle}°
          </span>
        </div>

        <div className="hidden sm:flex bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full items-center gap-1.5 font-mono text-[11px] text-gray-400">
          <Compass className="w-3.5 h-3.5 text-showroom-amber animate-spin" style={{ animationDuration: '8s' }} />
          <span>Interactive Orbit (Drag & Scroll)</span>
        </div>
      </div>

      <div className="absolute top-5 right-5 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
        <button
          onClick={() => setActiveMode('underglow')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
            activeMode === 'underglow'
              ? 'bg-showroom-teal text-black font-bold shadow-teal-glow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Cyber Underglow</span>
        </button>

        <button
          onClick={() => setActiveMode('xray')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
            activeMode === 'xray'
              ? 'bg-showroom-amber text-black font-bold shadow-amber-glow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>X-Ray Specs</span>
        </button>

        <button
          onClick={() => setActiveMode('3d')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
            activeMode === '3d'
              ? 'bg-white text-black font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>360° Studio</span>
        </button>
      </div>

      <div className="absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setActiveHotspot('headlight');
            onSelectVehicle?.('Audi e-tron GT RS');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono backdrop-blur-md border transition-all flex items-center gap-2 ${
            activeHotspot === 'headlight'
              ? 'bg-showroom-teal/20 border-showroom-teal text-showroom-teal shadow-teal-glow'
              : 'bg-black/60 border-white/15 text-gray-300 hover:border-white/40'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Matrix LED Headlights</span>
        </button>

        <button
          onClick={() => {
            setActiveHotspot('underglow');
            onSelectVehicle?.('Porsche Cayenne Turbo GT');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono backdrop-blur-md border transition-all flex items-center gap-2 ${
            activeHotspot === 'underglow'
              ? 'bg-showroom-amber/20 border-showroom-amber text-showroom-amber shadow-amber-glow'
              : 'bg-black/60 border-white/15 text-gray-300 hover:border-white/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Teal Laser Ground Glow</span>
        </button>

        <button
          onClick={() => {
            setActiveHotspot('chassis');
            onSelectVehicle?.('BMW i7 xDrive60');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono backdrop-blur-md border transition-all flex items-center gap-2 ${
            activeHotspot === 'chassis'
              ? 'bg-white/20 border-white text-white shadow-2xl'
              : 'bg-black/60 border-white/15 text-gray-300 hover:border-white/40'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Carbon-Core Chassis</span>
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-white/10 p-3 px-4 rounded-2xl">
        <div>
          <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Aero Drag (Cd)</div>
          <div className="font-mono text-sm font-bold text-showroom-teal">0.20 Cd</div>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Peak Power</div>
          <div className="font-mono text-sm font-bold text-showroom-amber">637 HP</div>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">0-60 MPH</div>
          <div className="font-mono text-sm font-bold text-white">2.9 sec</div>
        </div>
      </div>
    </div>
  );
};
