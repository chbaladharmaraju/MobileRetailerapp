import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import Logo from '../common/Logo';

const AuthLayout = () => {
  const location = useLocation();
  const isSignup = location.pathname === '/signup';
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden w-full select-none" style={{ backgroundColor: 'var(--om-bg)' }}>
      
      {/* Left Column - Form Container (100% width on Mobile/Tablet, 40% on Desktop) */}
      <div 
        className="w-full lg:w-[40%] xl:w-[35%] flex flex-col justify-between p-6 sm:p-10 md:p-12 z-10 shrink-0 relative min-h-screen lg:min-h-0" 
        style={{ 
          backgroundColor: 'var(--om-bg)', 
          borderRight: '1px solid var(--om-border)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* On mobile, we show the blurred background blobs for the glassy card effect */}
        <div className="absolute inset-0 z-0 opacity-40 lg:hidden pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full blur-[80px]"
            style={{ background: 'linear-gradient(135deg, var(--om-accent), var(--om-purple))' }} />
          <div className="absolute bottom-[-10%] right-[-5%] w-[250px] h-[250px] rounded-full blur-[80px]"
            style={{ background: 'linear-gradient(135deg, var(--om-orange), var(--om-accent))' }} />
        </div>

        {/* Top Header - Logo and Small Branding */}
        <div className="relative z-10 flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Logo className="w-9 h-9" />
            <div className="flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="text-xs font-black tracking-wider uppercase" style={{ color: 'var(--om-orange)', letterSpacing: '0.15em' }}>
                Orange Retail
              </span>
              <span className="text-[9px] font-bold" style={{ color: 'var(--om-text-muted)' }}>
                Digital Platform
              </span>
            </div>
          </Link>
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all duration-300 active:scale-95 border"
            style={{ 
              backgroundColor: 'var(--om-surface)', 
              borderColor: 'var(--om-border)', 
              color: 'var(--om-text-secondary)' 
            }}
          >
            {theme === 'dark' ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Form Section (Perfectly Centered Horizontally & Vertically) */}
        <div 
          className="relative z-10 my-auto py-6 w-full"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1
          }}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '380px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              margin: '0 auto'
            }}
          >
            <div className="flex flex-col gap-2 px-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--om-text)', margin: 0 }}>
                {isSignup ? 'Create account.' : 'Welcome back.'}
              </h1>
              <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--om-text-secondary)', margin: 0 }}>
                {isSignup 
                  ? 'Register to establish your store management profile.' 
                  : 'Sign in to access your digital retail & sales platform.'}
              </p>
            </div>

            {/* Glass Card Wrapper for Forms with explicit inline padding */}
            <div 
              className="glass-card transition-all duration-500"
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid var(--om-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                borderRadius: '16px',
                padding: '32px 28px', // Explicit vertical and horizontal padding
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <Outlet />
            </div>
          </div>
        </div>

        {/* Bottom - Pagination Dots & Footer */}
        <div className="relative z-10 flex items-center justify-between border-t pt-5" style={{ borderColor: 'var(--om-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
            <span className="w-2.5 h-2.5 rounded-full transition-all duration-500" style={{ backgroundColor: !isSignup ? 'var(--om-orange)' : 'var(--om-border)', width: !isSignup ? '24px' : '10px' }} />
            <span className="w-2.5 h-2.5 rounded-full transition-all duration-500" style={{ backgroundColor: isSignup ? 'var(--om-orange)' : 'var(--om-border)', width: isSignup ? '24px' : '10px' }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--om-text-muted)', letterSpacing: '0.12em' }}>
            Orange Retail © 2026
          </span>
        </div>

      </div>

      {/* Right Column - Brand Presentation (60% width, Hidden on Mobile/Tablet) */}
      <div 
        className="hidden lg:flex lg:w-[60%] xl:w-[65%] relative overflow-hidden flex-col justify-between p-16"
        style={{
          background: 'linear-gradient(135deg, #0d121a 0%, #15102a 60%, #080c10 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* Animated fluid mesh gradients */}
        <div className="absolute inset-0 z-0 opacity-85 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] rounded-full blur-[140px]"
            style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 60%)' }} />
          <div className="absolute -bottom-[20%] -right-[10%] w-[90%] h-[90%] rounded-full blur-[160px]"
            style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }} />
          
          <svg className="absolute bottom-0 right-0 w-full h-full opacity-40" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,200 C 300,150 400,350 700,250 C 900,180 950,220 1000,150 L 1000,1000 L 0,1000 Z" fill="url(#waveGrad)" />
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.12)" />
                <stop offset="50%" stopColor="rgba(99, 102, 241, 0.1)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.14)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Navigation Items */}
        <div className="relative z-10 flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex gap-8" style={{ display: 'flex', gap: '32px' }}>
            <a href="#features" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#analytics" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Analytics</a>
            <a href="#security" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            System Status
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
        </div>

        {/* Big Greeting Text */}
        <div className="relative z-10 max-w-xl my-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
            className="space-y-6"
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <h2 className="text-6xl sm:text-7xl font-black text-white tracking-tight leading-none" style={{ margin: 0 }}>
              Welcome.
            </h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed" style={{ margin: 0 }}>
              Unify your retail operations. Manage sales, track parts/repairs, oversee customer ledgers, and view detailed digital analysis reports—all from one cohesive dashboard.
            </p>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-orange-500 to-indigo-500" style={{ height: '4px', width: '64px', borderRadius: '999px' }} />
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-semibold" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Enterprise Secure & Verified Database</span>
          <div className="flex gap-4" style={{ display: 'flex', gap: '16px' }}>
            <a href="#terms" className="hover:underline">Terms</a>
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AuthLayout;
