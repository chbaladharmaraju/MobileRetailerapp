import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card px-6 py-7 sm:px-8 sm:py-8"
      style={{ backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest ml-0.5 block"
            style={{ color: 'var(--om-text-muted)' }}>Full Name</label>
          <div className="relative">
            <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--om-text-muted)' }} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="ag-input ag-input-with-icon" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest ml-0.5 block"
            style={{ color: 'var(--om-text-muted)' }}>Email Address</label>
          <div className="relative">
            <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--om-text-muted)' }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="ag-input ag-input-with-icon" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest ml-0.5 block"
            style={{ color: 'var(--om-text-muted)' }}>Password</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--om-text-muted)' }} />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="ag-input ag-input-with-icon pr-12" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--om-text-muted)' }}>
              {showPassword ? <HiOutlineEyeOff className="w-4.5 h-4.5" /> : <HiOutlineEye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        <div className="pt-1">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading} className="ag-btn ag-btn-primary w-full py-3 h-12 text-sm font-semibold">
            {loading ? <div className="w-5 h-5 border-2 border-ag-border border-t-white rounded-full animate-spin" /> : 'Create Account'}
          </motion.button>
        </div>
      </form>

      <div className="mt-7 pt-5 text-center" style={{ borderTop: '1px solid var(--om-border)' }}>
        <p className="text-sm" style={{ color: 'var(--om-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold transition-colors" style={{ color: 'var(--om-accent)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
