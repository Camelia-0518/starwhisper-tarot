import { useEffect, useRef, memo } from 'react';

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speed: number;
  opacity: number;
  targetOpacity: number;
  twinkleSpeed: number;
  color: string;
  displacement: { x: number; y: number };
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
}

const ParticleBackground = memo(function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const lastShootingStarRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    resize();

    // Initialize 500 stars
    const colors = ['#F0E6FF', '#C9A84C'];
    const starCount = 500;
    starsRef.current = Array.from({ length: starCount }, () => {
      const x = Math.random() * w;
      const y = Math.random() * h;
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        size: 0.5 + Math.random() * 2.5,
        speed: 0.1 + Math.random() * 0.2,
        opacity: 0.2 + Math.random() * 0.8,
        targetOpacity: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        color: colors[Math.random() < 0.7 ? 0 : 1],
        displacement: { x: 0, y: 0 },
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    const animate = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Shooting stars
      if (time - lastShootingStarRef.current > 8000 + Math.random() * 4000) {
        shootingStarsRef.current.push({
          x: w * 0.6 + Math.random() * w * 0.4,
          y: -50,
          length: 80 + Math.random() * 120,
          speed: 3 + Math.random() * 2,
          opacity: 1,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.3,
        });
        lastShootingStarRef.current = time;
      }

      // Update and draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
        ss.x -= Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.008;

        if (ss.opacity <= 0) return false;

        const grad = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x + Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        grad.addColorStop(0, `rgba(201, 168, 76, 0)`);
        grad.addColorStop(1, `rgba(201, 168, 76, ${ss.opacity})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x + Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        ctx.stroke();

        return true;
      });

      // Update and draw stars
      for (const star of starsRef.current) {
        // Drift
        star.baseX += (Math.random() - 0.5) * star.speed;
        star.baseY += (Math.random() - 0.5) * star.speed;

        // Wrap around
        if (star.baseX < 0) star.baseX = w;
        if (star.baseX > w) star.baseX = 0;
        if (star.baseY < 0) star.baseY = h;
        if (star.baseY > h) star.baseY = 0;

        // Mouse gravity (200px radius)
        const dx = mx - star.baseX;
        const dy = my - star.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.5;
          star.displacement.x += (dx / dist) * force;
          star.displacement.y += (dy / dist) * force;
        }

        // Lerp decay for displacement
        star.displacement.x *= 0.95;
        star.displacement.y *= 0.95;

        star.x = star.baseX + star.displacement.x;
        star.y = star.baseY + star.displacement.y;

        // Twinkle
        star.opacity += (star.targetOpacity - star.opacity) * star.twinkleSpeed;
        if (Math.abs(star.opacity - star.targetOpacity) < 0.05) {
          star.targetOpacity = 0.2 + Math.random() * 0.8;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.fill();

        // Glow for larger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 3
          );
          grad.addColorStop(0, star.color === '#C9A84C' ? 'rgba(201,168,76,0.15)' : 'rgba(240,230,255,0.1)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.globalAlpha = star.opacity * 0.5;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
});

export default ParticleBackground;
