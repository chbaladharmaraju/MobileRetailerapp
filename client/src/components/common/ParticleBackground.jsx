import { useEffect, useRef, useCallback } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const isMobileRef = useRef(false);

  const createParticle = useCallback((width, height, isMobile) => {
    const baseSpeed = isMobile ? 0.15 : 0.25;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * (isMobile ? 1.8 : 2.5) + 0.5,
      vx: (Math.random() - 0.5) * baseSpeed,
      vy: (Math.random() - 0.5) * baseSpeed,
      alpha: Math.random() * 0.5 + 0.1,
      alphaDir: (Math.random() - 0.5) * 0.008,
      phase: Math.random() * Math.PI * 2,
      waveAmp: Math.random() * 0.3 + 0.1,
      waveFreq: Math.random() * 0.002 + 0.001,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);

      isMobileRef.current = rect.width < 768;
      const count = isMobileRef.current ? 40 : rect.width < 1024 ? 70 : 120;

      // Re-initialize particles only if count changed significantly
      if (Math.abs(particlesRef.current.length - count) > 10) {
        particlesRef.current = Array.from({ length: count }, () =>
          createParticle(rect.width, rect.height, isMobileRef.current)
        );
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const handleMouseMove = (e) => {
      const rect = canvas.parentElement.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.parentElement.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const animate = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const { x: mx, y: my } = mouseRef.current;
      const isMobile = isMobileRef.current;
      const connectionDist = isMobile ? 80 : 140;
      const mouseInfluence = isMobile ? 0 : 50;
      time += 1;

      const particles = particlesRef.current;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Wave motion
        p.x += p.vx + Math.sin(time * p.waveFreq + p.phase) * p.waveAmp * 0.3;
        p.y += p.vy + Math.cos(time * p.waveFreq + p.phase) * p.waveAmp * 0.2;

        // Mouse repulsion (desktop only)
        if (mouseInfluence > 0) {
          const dxm = p.x - mx;
          const dym = p.y - my;
          const distMouse = Math.sqrt(dxm * dxm + dym * dym);
          if (distMouse < mouseInfluence * 2.5) {
            const force = (1 - distMouse / (mouseInfluence * 2.5)) * 0.8;
            p.x += (dxm / distMouse) * force;
            p.y += (dym / distMouse) * force;
          }
        }

        // Fade in/out
        p.alpha += p.alphaDir;
        if (p.alpha <= 0.05 || p.alpha >= 0.6) p.alphaDir *= -1;
        p.alpha = Math.max(0.05, Math.min(0.6, p.alpha));

        // Wrap edges with padding
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Draw glow
        const glowRadius = p.radius * 4;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        glow.addColorStop(0, `rgba(255, 169, 77, ${p.alpha * 0.4})`);
        glow.addColorStop(1, 'rgba(255, 169, 77, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Draw particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 138, 0, ${p.alpha})`;
        ctx.fill();
      }

      // Draw connection lines (skip on mobile for performance)
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDist) {
              const lineAlpha = (1 - dist / connectionDist) * 0.12;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(255, 138, 0, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        // Mouse connection lines
        if (mx > 0 && my > 0) {
          for (let i = 0; i < particles.length; i++) {
            const dx = particles[i].x - mx;
            const dy = particles[i].y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDist * 1.2) {
              const lineAlpha = (1 - dist / (connectionDist * 1.2)) * 0.2;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(mx, my);
              ctx.strokeStyle = `rgba(255, 169, 77, ${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default ParticleBackground;
