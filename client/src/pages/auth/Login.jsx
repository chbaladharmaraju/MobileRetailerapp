import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Email Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label 
            className="text-[10px] font-bold uppercase ml-1 block"
            style={{ color: 'var(--om-text-muted)', letterSpacing: '0.12em', margin: 0 }}
          >
            Email Address
          </label>
          <div className="relative group">
            <HiOutlineMail 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 group-focus-within:text-[var(--om-orange)]" 
              style={{ color: 'var(--om-text-muted)' }} 
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="ag-input ag-input-with-icon w-full pl-11 h-12"
              style={{
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                backgroundColor: 'var(--om-input-bg)',
                borderColor: 'var(--om-input-border)',
                borderRadius: '12px'
              }}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label 
            className="text-[10px] font-bold uppercase ml-1 block"
            style={{ color: 'var(--om-text-muted)', letterSpacing: '0.12em', margin: 0 }}
          >
            Password
          </label>
          <div className="relative group">
            <HiOutlineLockClosed 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 group-focus-within:text-[var(--om-orange)]" 
              style={{ color: 'var(--om-text-muted)' }} 
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="ag-input ag-input-with-icon w-full pl-11 pr-12 h-12"
              style={{
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                backgroundColor: 'var(--om-input-bg)',
                borderColor: 'var(--om-input-border)',
                borderRadius: '12px'
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 hover:text-[var(--om-orange)]"
              style={{ color: 'var(--om-text-muted)' }}
            >
              {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ paddingTop: '4px' }}>
          <motion.button
            whileHover={{ scale: 1.01, translateY: -1 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="ag-btn w-full py-3 h-12 text-sm font-semibold rounded-xl text-white shadow-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--om-orange), #ea580c)',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
              margin: 0
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </motion.button>
        </div>
      </form>

      {/* Demo Credentials Utilities */}
      <div 
        className="rounded-2xl transition-all duration-300 hover:shadow-md"
        style={{ 
          backgroundColor: 'var(--om-surface)', 
          border: '1px dashed rgba(249, 115, 22, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px' // Explicit padding inside the dashed credentials box
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span 
            className="text-[10px] font-extrabold uppercase tracking-widest" 
            style={{ color: 'var(--om-orange)', letterSpacing: '0.12em' }}
          >
            Recruiter Quick Access
          </span>
          <span 
            className="text-[9px] font-bold px-2 py-0.5 rounded-full" 
            style={{ color: 'var(--om-orange)', backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
          >
            Demo Mode
          </span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--om-text-secondary)', margin: 0 }}>
          Log in instantly with preset administrative privileges to explore the portal features.
        </p>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => {
            setEmail('admin@orange.com');
            setPassword('admin123');
            toast.success('Demo credentials loaded!');
          }}
          className="ag-btn w-full py-2 h-10 text-[11px] font-bold hover-scale active-scale flex items-center justify-center gap-2 border"
          style={{ 
            borderColor: 'var(--om-orange)', 
            color: 'var(--om-orange)',
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
            borderRadius: '10px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.05)';
          }}
        >
          Autofill Demo Account
        </motion.button>
      </div>

      {/* Footer Signup Link */}
      <div className="text-center" style={{ borderTop: '1px solid var(--om-border)', paddingTop: '16px' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--om-text-secondary)', margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold transition-colors duration-300 hover:text-[var(--om-orange)]" style={{ color: 'var(--om-accent)' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
