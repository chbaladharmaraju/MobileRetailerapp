import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const AuthLayout = () => {
  const location = useLocation();
  const isSignup = location.pathname === '/signup';
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{ backgroundColor: 'var(--om-bg)' }}
    >
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-40"
        style={{ background: 'linear-gradient(135deg, var(--om-accent), var(--om-purple))' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] rounded-full blur-[100px] opacity-30"
        style={{ background: 'linear-gradient(135deg, var(--om-orange), var(--om-accent))' }} />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2.5 rounded-xl z-20 transition-all duration-300 active:scale-95"
        style={{ backgroundColor: 'var(--om-surface)', border: '1px solid var(--om-border)', color: 'var(--om-text-secondary)' }}
      >
        {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-32 h-20 mb-5 overflow-hidden flex items-center justify-center">
            <img src="https://res.cloudinary.com/dogxrczp3/image/upload/v1773350425/logo_2_qlc6y5.png" alt="Orange Mobile Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--om-text)' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm font-medium mt-2 text-center" style={{ color: 'var(--om-text-secondary)' }}>
            {isSignup ? 'Get started with Orange Mobile Retail' : 'Sign in to your Orange Mobile dashboard'}
          </p>
        </div>

        <Outlet />
      </motion.div>
    </div>
  );
};

export default AuthLayout;
