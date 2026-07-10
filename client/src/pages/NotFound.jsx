import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import Logo from '../components/common/Logo';

const NotFound = () => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" 
      style={{ backgroundColor: '#0B0F14', color: '#F8FAFC' }}
    >
      {/* Background Mesh Blobs */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full blur-[100px]"
          style={{ background: 'linear-gradient(135deg, var(--om-orange), var(--om-purple))' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: 'linear-gradient(135deg, var(--om-accent), var(--om-purple))' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center flex flex-col items-center gap-6 max-w-sm w-full"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
      >
        {/* Animated Brand Logo */}
        <Logo className="w-16 h-16 mb-2" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Stylized Error Badge */}
          <div className="flex items-center justify-center gap-2 text-orange-500" style={{ color: 'var(--om-orange)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <HiOutlineExclamationCircle className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>
              Error 404
            </span>
          </div>
          
          <h1 className="text-3xl font-black tracking-tight text-white leading-none" style={{ margin: 0 }}>
            Page Not Found.
          </h1>
          <p className="text-xs leading-relaxed text-slate-400" style={{ color: 'var(--om-text-secondary)', margin: 0 }}>
            The path you requested does not exist, or has been moved to a new destination.
          </p>
        </div>

        {/* Back Button */}
        <div className="w-full" style={{ width: '100%' }}>
          <Link to="/login" className="w-full block" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.01, translateY: -1 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              className="ag-btn w-full py-3 h-12 text-sm font-bold rounded-xl text-white shadow-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--om-orange), #ea580c)',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </motion.button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4" style={{ color: 'var(--om-text-muted)', letterSpacing: '0.12em', margin: 0 }}>
          Orange Retail Platform
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
